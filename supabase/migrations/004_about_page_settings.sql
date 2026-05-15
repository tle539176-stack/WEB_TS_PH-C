-- Migration 004: About page settings for Dr. Dang Huu Phuc
-- Adds editable /about content to the settings key-value store.

insert into settings (key, value)
values (
  'about',
  jsonb_build_object(
    'aboutTitle', 'Tiến sĩ Đặng Hữu Phúc',
    'aboutSubtitle', 'Chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm',
    'aboutQuote', 'Kiến thức đúng giúp người đọc hiểu rõ hơn và ra quyết định sức khỏe thận trọng hơn.',
    'aboutSectionTitle', 'Giới thiệu',
    'aboutBody', 'Chào bạn, tôi là Tiến sĩ Đặng Hữu Phúc. Tôi sinh ra trong một gia đình có truyền thống y học lâu đời và là truyền nhân đời thứ 6 của dòng y Đặng Gia Đường. Trong quá trình học tập, nghiên cứu và thực hành lâm sàng, tôi theo đuổi định hướng kết hợp giữa y học cổ truyền và y học hiện đại, với trọng tâm chuyên sâu về chống lão hóa, y học dự phòng và chăm sóc sức khỏe chủ động.' || E'\n\n' || 'Tôi đặc biệt quan tâm đến các cơ chế nền tảng của lão hóa, chuyển hóa, viêm mạn tính và sự suy giảm chức năng cơ thể theo thời gian. Quan điểm chuyên môn của tôi là không chỉ điều trị triệu chứng, mà cần tiếp cận từ căn nguyên, tối ưu sức khỏe nội tại và nâng cao chất lượng sống một cách bền vững.' || E'\n\n' || 'Website này được xây dựng với mục tiêu chia sẻ những kiến thức y khoa chính thống, có cơ sở khoa học, được diễn đạt theo hướng dễ hiểu và có tính ứng dụng thực tiễn trong đời sống hằng ngày. Tôi tin rằng khi mỗi người hiểu đúng về cơ thể, về quá trình lão hóa và các yếu tố ảnh hưởng đến sức khỏe, chúng ta có thể chủ động phòng ngừa bệnh lý, làm chậm quá trình suy giảm sinh học và duy trì trạng thái khỏe mạnh lâu dài.',
    'aboutHighlights', 'Giáo dục sức khỏe cộng đồng' || E'\n' || 'Kiến thức y khoa dễ hiểu' || E'\n' || 'Nội dung có nguồn tham khảo' || E'\n' || 'Khuyến khích thăm khám đúng lúc',
    'aboutImage', '',
    'aboutStoragePath', '',
    'aboutImageAlt', 'Tiến sĩ Đặng Hữu Phúc'
  )
)
on conflict (key) do update
set value = excluded.value || settings.value,
    updated_at = now();

update settings
set value = value
  || jsonb_build_object(
    'siteName', 'Tiến sĩ Đặng Hữu Phúc',
    'logoText', 'DP',
    'tagline', 'Kiến thức sức khỏe chính thống',
    'footerText', 'Website chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng.',
    'seoTitle', 'Tiến sĩ Đặng Hữu Phúc',
    'seoDescription', 'Website chia sẻ kiến thức sức khỏe, ghi chú, sách và nội dung tham khảo của Tiến sĩ Đặng Hữu Phúc.'
  ),
  updated_at = now()
where key = 'global'
  and (
    value ->> 'siteName' = 'Bác sĩ Wynn Tran'
    or value ->> 'logoText' = 'WT'
    or value ->> 'tagline' = 'Medical Professional'
  );
