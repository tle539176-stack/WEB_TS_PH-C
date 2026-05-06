import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildFacebookEmbedUrl } from '@/services/videoService';
import type { Video } from '@/types/database';

type Props = {
  videos: Video[];
  facebookUrl?: string;
};

function getEmbedUrl(video: Video): string {
  return buildFacebookEmbedUrl(video.video_url);
}

function isDemoVideo(video: Video): boolean {
  return video.video_url.startsWith('#demo-video');
}

export function FacebookVideoStrip({ videos, facebookUrl }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  if (videos.length === 0) return null;

  const firstRealVideoUrl = videos.find(video => !isDemoVideo(video))?.video_url;
  const viewMoreUrl = facebookUrl || firstRealVideoUrl;

  return (
    <section className="border-y border-[#0A3151]/10 bg-white py-14 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h2 className="text-center text-2xl font-bold tracking-wide text-[#0A3151] md:text-3xl">
          Video mới từ Facebook
        </h2>

        <div className="mt-8 flex items-center gap-2 px-1 text-sm font-medium text-[#0A3151]">
          <MoreVertical className="h-5 w-5 text-[#0A3151]" />
          <span>Các video gần đây của TS. ĐẶNG HỮU PHÚC</span>
        </div>

        <div className="relative mt-5">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] md:gap-5">
            {videos.map((video) => (
              <article
                key={video.id}
                className="min-w-[190px] max-w-[190px] snap-start sm:min-w-[210px] sm:max-w-[210px] lg:min-w-[230px] lg:max-w-[230px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isDemoVideo(video)) setActiveVideo(video);
                  }}
                  className="group relative block aspect-[9/16] w-full overflow-hidden bg-[#0A3151]/10 text-left shadow-sm"
                  aria-label={`Phát video ${video.title}`}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="public-on-blue flex h-full w-full items-center justify-center bg-[#0A3151] text-white">
                      <span className="px-4 text-center text-sm font-semibold text-white">Facebook Reels</span>
                    </div>
                  )}

                  <span className="public-on-blue absolute inset-0 m-auto flex h-13 w-13 items-center justify-center border-2 border-white bg-[#0A3151] text-white shadow-lg">
                    <Play className="ml-1 h-6 w-6 fill-white text-white" />
                  </span>

                  {video.duration && (
                    <span className="public-on-blue absolute bottom-3 right-3 bg-[#0A3151] px-2 py-1 text-xs font-semibold text-white">
                      {video.duration}
                    </span>
                  )}

                  {video.category && (
                    <span className="public-on-blue absolute bottom-3 left-3 max-w-[62%] truncate bg-[#0A3151] px-2 py-1 text-[11px] font-semibold text-white">
                      {video.category}
                    </span>
                  )}
                </button>

                <h3 className="mt-4 line-clamp-2 text-[15px] font-bold leading-snug text-[#0A3151]">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#0A3151]">
                    {video.description}
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 items-center justify-start bg-gradient-to-r from-white to-transparent md:flex">
            <ChevronLeft className="h-8 w-8 text-[#0A3151]" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 items-center justify-end bg-gradient-to-l from-white to-transparent md:flex">
            <ChevronRight className="h-8 w-8 text-[#0A3151]" />
          </div>
        </div>

        {viewMoreUrl && (
          <div className="mt-8 flex justify-center">
            <a href={viewMoreUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-[#0A3151] px-8 text-[#0A3151] hover:bg-[#0A3151] hover:text-white">
                Xem thêm
              </Button>
            </a>
          </div>
        )}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3151]/95 p-4">
          <div className="relative h-[88vh] w-full max-w-[430px] bg-[#0A3151] shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="public-text-blue absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center bg-white text-[#0A3151] shadow-lg md:-right-12 md:top-0"
              aria-label="Đóng video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full w-full">
              <iframe
                src={getEmbedUrl(activeVideo)}
                className="h-full w-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                title={activeVideo.title}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
