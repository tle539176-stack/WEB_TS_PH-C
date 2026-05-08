import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
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
    <section className="border-y border-[#0A3151]/10 bg-white py-12 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="mb-6 border-b border-[#0A3151]/10 pb-4 text-left">
          <h2 className="public-section-title uppercase">
            Video mới từ Facebook
          </h2>
        </div>

        <div className="relative mt-4">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden">
            {videos.map((video) => (
              <article
                key={video.id}
                className="w-[calc((100vw-44px)/2)] min-w-[138px] max-w-[180px] shrink-0 snap-start sm:w-[132px] sm:max-w-[132px] md:w-[150px] md:max-w-[150px] lg:w-[210px] lg:max-w-[210px] xl:w-[230px] xl:max-w-[230px]"
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

                  {video.duration && (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white backdrop-blur-sm md:bottom-2 md:right-2 md:text-[10px]">
                      {video.duration}
                    </span>
                  )}
                </button>

                <h3 className="public-compact-title mt-3 line-clamp-2">
                  {video.title}
                </h3>
              </article>
            ))}
          </div>
          <div className="public-scroll-arrow pointer-events-none absolute right-0 top-1/2 z-10 flex -translate-y-1/2 drop-shadow-[0_1px_2px_rgba(10,49,81,0.65)]">
            <ChevronRight className="h-7 w-7 animate-pulse md:h-8 md:w-8" strokeWidth={3} aria-hidden="true" />
          </div>

        </div>

        {viewMoreUrl && (
          <div className="mt-7 flex justify-center">
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
              className="absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg transition-all hover:bg-white/30 hover:scale-105 md:-right-12 md:top-0"
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
