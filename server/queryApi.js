import { query } from './db.js';

const TABLES = new Set([
  'categories',
  'products',
  'product_images',
  'books',
  'book_images',
  'notes',
  'settings',
  'audit_logs',
  'videos',
  'media_assets',
  'people',
  'note_sources',
  'content_reviews',
  'content_revisions',
  'content_media',
]);

const PUBLIC_TABLES = new Set([
  'categories',
  'products',
  'product_images',
  'books',
  'book_images',
  'notes',
  'settings',
  'videos',
  'media_assets',
  'people',
  'note_sources',
  'content_reviews',
  'content_media',
]);

function assertTable(table) {
  if (!TABLES.has(table)) {
    throw new Error(`Table is not allowed: ${table}`);
  }
}

function assertIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Unsafe identifier: ${value}`);
  }
}

function quote(value) {
  assertIdentifier(value);
  return `"${value}"`;
}

function cleanRow(row) {
  return Object.fromEntries(
    Object.entries(row ?? {}).filter(([, value]) => value !== undefined),
  );
}

function parseSelect(columns = '*') {
  const nested = [];
  let base = columns;
  for (const relation of ['product_images', 'book_images', 'categories', 'note_sources']) {
    if (base.includes(`${relation}(*)`)) {
      nested.push(relation);
      base = base.replace(`${relation}(*)`, '');
    }
  }

  const rawBaseColumns = base
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const allColumns = rawBaseColumns.length === 0 || rawBaseColumns.includes('*');
  return {
    allColumns,
    columns: allColumns ? [] : rawBaseColumns,
    nested,
  };
}

function buildColumnList(select) {
  if (select?.options?.head) return 'count(*)::int as count';
  const parsed = parseSelect(select?.columns ?? '*');
  if (parsed.allColumns) return '*';
  return parsed.columns.map(quote).join(', ');
}

function addWhere(parts, params, sql, value) {
  params.push(value);
  parts.push(`${sql} $${params.length}`);
}

function buildFilter(filter, parts, params) {
  const column = quote(filter.column);
  switch (filter.operator) {
    case 'eq':
      addWhere(parts, params, `${column} =`, filter.value);
      break;
    case 'neq':
      addWhere(parts, params, `${column} !=`, filter.value);
      break;
    case 'lte':
      addWhere(parts, params, `${column} <=`, filter.value);
      break;
    case 'in':
      params.push(filter.value ?? []);
      parts.push(`${column} = any($${params.length})`);
      break;
    case 'is':
      if (filter.value === null) parts.push(`${column} is null`);
      else if (filter.value === true) parts.push(`${column} is true`);
      else if (filter.value === false) parts.push(`${column} is false`);
      break;
    case 'not':
      if (filter.innerOperator === 'is' && filter.value === null) {
        parts.push(`${column} is not null`);
      }
      break;
    default:
      throw new Error(`Unsupported filter: ${filter.operator}`);
  }
}

function parseOrTerm(term, params) {
  const [column, operator, ...rest] = term.split('.');
  const value = rest.join('.');
  const quoted = quote(column);

  if (operator === 'is' && value === 'null') {
    return `${quoted} is null`;
  }

  if (operator === 'ilike') {
    params.push(value);
    return `${quoted} ilike $${params.length}`;
  }

  throw new Error(`Unsupported OR filter: ${term}`);
}

function buildWhere(payload, isAdmin) {
  const parts = [];
  const params = [];

  for (const filter of payload.filters ?? []) {
    if (filter.operator === 'or') {
      const orParts = String(filter.value)
        .split(',')
        .map(term => term.trim())
        .filter(Boolean)
        .map(term => parseOrTerm(term, params));
      if (orParts.length > 0) parts.push(`(${orParts.join(' or ')})`);
      continue;
    }
    buildFilter(filter, parts, params);
  }

  if (!isAdmin) {
    switch (payload.table) {
      case 'products':
      case 'books':
      case 'notes':
        parts.push(`"status" = 'published'`);
        break;
      case 'people':
        parts.push(`"is_public" is true`);
        break;
      case 'videos':
        parts.push(`"is_active" is true`);
        break;
      case 'audit_logs':
      case 'content_revisions':
        parts.push('false');
        break;
      default:
        break;
    }
  }

  return {
    sql: parts.length > 0 ? ` where ${parts.join(' and ')}` : '',
    params,
  };
}

function buildOrder(payload) {
  const orders = payload.orders ?? [];
  if (orders.length === 0) return '';
  return ` order by ${orders.map(order => `${quote(order.column)} ${order.ascending === false ? 'desc' : 'asc'}`).join(', ')}`;
}

function buildLimit(payload, params) {
  if (!payload.limit) return '';
  params.push(Number(payload.limit));
  return ` limit $${params.length}`;
}

async function attachNestedRows(rows, select) {
  const parsed = parseSelect(select?.columns ?? '*');
  if (rows.length === 0 || parsed.nested.length === 0) return rows;

  if (parsed.nested.includes('product_images')) {
    const ids = rows.map(row => row.id);
    const { rows: images } = await query(
      'select * from product_images where product_id = any($1) order by sort_order asc',
      [ids],
    );
    const byProduct = groupBy(images, 'product_id');
    rows.forEach(row => { row.product_images = byProduct.get(row.id) ?? []; });
  }

  if (parsed.nested.includes('book_images')) {
    const ids = rows.map(row => row.id);
    const { rows: images } = await query(
      'select * from book_images where book_id = any($1) order by sort_order asc',
      [ids],
    );
    const byBook = groupBy(images, 'book_id');
    rows.forEach(row => { row.book_images = byBook.get(row.id) ?? []; });
  }

  if (parsed.nested.includes('categories')) {
    const ids = [...new Set(rows.map(row => row.category_id).filter(Boolean))];
    const { rows: categories } = ids.length > 0
      ? await query('select * from categories where id = any($1)', [ids])
      : { rows: [] };
    const byId = new Map(categories.map(category => [category.id, category]));
    rows.forEach(row => { row.categories = row.category_id ? byId.get(row.category_id) ?? null : null; });
  }

  if (parsed.nested.includes('note_sources')) {
    const ids = rows.map(row => row.id);
    const { rows: sources } = await query(
      'select * from note_sources where note_id = any($1) order by sort_order asc',
      [ids],
    );
    const byNote = groupBy(sources, 'note_id');
    rows.forEach(row => { row.note_sources = byNote.get(row.id) ?? []; });
  }

  return rows;
}

function groupBy(rows, key) {
  const result = new Map();
  for (const row of rows) {
    const group = result.get(row[key]) ?? [];
    group.push(row);
    result.set(row[key], group);
  }
  return result;
}

function formatResult(rows, payload, count = null) {
  if (payload.select?.options?.head) {
    return { data: null, error: null, count };
  }

  if (payload.resultMode === 'single') {
    if (rows.length === 0) return { data: null, error: { message: 'No rows found' }, count };
    return { data: rows[0], error: null, count };
  }

  if (payload.resultMode === 'maybeSingle') {
    return { data: rows[0] ?? null, error: null, count };
  }

  return { data: rows, error: null, count };
}

export async function handleDbQuery(payload, user) {
  assertTable(payload.table);
  const isAdmin = user?.role === 'admin';

  if (!isAdmin && payload.action !== 'select') {
    return { status: 403, body: { data: null, error: { message: 'Admin login required' }, count: null } };
  }

  if (!isAdmin && !PUBLIC_TABLES.has(payload.table)) {
    return { status: 403, body: { data: null, error: { message: 'Not allowed' }, count: null } };
  }

  switch (payload.action) {
    case 'select':
      return { status: 200, body: await selectRows(payload, isAdmin) };
    case 'insert':
      return { status: 200, body: await insertRows(payload) };
    case 'update':
      return { status: 200, body: await updateRows(payload, isAdmin) };
    case 'delete':
      return { status: 200, body: await deleteRows(payload, isAdmin) };
    case 'upsert':
      return { status: 200, body: await upsertRows(payload) };
    default:
      return { status: 400, body: { data: null, error: { message: `Unsupported action: ${payload.action}` }, count: null } };
  }
}

async function selectRows(payload, isAdmin) {
  const selectColumns = buildColumnList(payload.select);
  const where = buildWhere(payload, isAdmin);
  const params = [...where.params];
  const order = payload.select?.options?.head ? '' : buildOrder(payload);
  const limit = payload.select?.options?.head ? '' : buildLimit(payload, params);
  const table = quote(payload.table);
  const sql = `select ${selectColumns} from ${table}${where.sql}${order}${limit}`;
  const result = await query(sql, params);

  if (payload.select?.options?.head) {
    return formatResult([], payload, result.rows[0]?.count ?? 0);
  }

  const rows = await attachNestedRows(result.rows, payload.select);
  return formatResult(rows, payload);
}

async function insertRows(payload) {
  const inputRows = Array.isArray(payload.values) ? payload.values : [payload.values];
  const rows = inputRows.map(cleanRow).filter(row => Object.keys(row).length > 0);
  if (rows.length === 0) return { data: [], error: null, count: null };

  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
  columns.forEach(assertIdentifier);

  const params = [];
  const valuesSql = rows.map(row => {
    const placeholders = columns.map(column => {
      params.push(row[column] ?? null);
      return `$${params.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });

  const sql = `
    insert into ${quote(payload.table)} (${columns.map(quote).join(', ')})
    values ${valuesSql.join(', ')}
    returning *
  `;

  const result = await query(sql, params);
  return formatResult(result.rows, payload);
}

async function updateRows(payload, isAdmin) {
  const values = cleanRow(payload.values);
  const columns = Object.keys(values);
  if (columns.length === 0) return { data: null, error: null, count: null };
  columns.forEach(assertIdentifier);

  const params = [];
  const assignments = columns.map(column => {
    params.push(values[column]);
    return `${quote(column)} = $${params.length}`;
  });

  const where = buildWhere(payload, isAdmin);
  params.push(...where.params);

  const sql = `
    update ${quote(payload.table)}
    set ${assignments.join(', ')}
    ${where.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + columns.length}`)}
    returning *
  `;

  const result = await query(sql, params);
  return payload.returning ? formatResult(result.rows, payload) : { data: null, error: null, count: null };
}

async function deleteRows(payload, isAdmin) {
  const where = buildWhere(payload, isAdmin);
  const sql = `delete from ${quote(payload.table)}${where.sql} returning *`;
  const result = await query(sql, where.params);
  return payload.returning ? formatResult(result.rows, payload) : { data: null, error: null, count: null };
}

async function upsertRows(payload) {
  const values = cleanRow(payload.values);
  const columns = Object.keys(values);
  if (columns.length === 0) return { data: null, error: null, count: null };
  columns.forEach(assertIdentifier);

  const conflictColumn = payload.onConflict || 'id';
  assertIdentifier(conflictColumn);

  const params = [];
  const placeholders = columns.map(column => {
    params.push(values[column]);
    return `$${params.length}`;
  });
  const updates = columns
    .filter(column => column !== conflictColumn)
    .map(column => `${quote(column)} = excluded.${quote(column)}`);

  const sql = `
    insert into ${quote(payload.table)} (${columns.map(quote).join(', ')})
    values (${placeholders.join(', ')})
    on conflict (${quote(conflictColumn)}) do update
    set ${updates.length > 0 ? updates.join(', ') : `${quote(conflictColumn)} = excluded.${quote(conflictColumn)}`}
    returning *
  `;

  const result = await query(sql, params);
  return formatResult(result.rows, payload);
}
