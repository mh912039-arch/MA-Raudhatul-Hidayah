import { ContentManager } from "@/components/admin/ContentManager";
import { samplePosts, sampleAnnouncements, sampleGallery } from "@/lib/sample";
export default function Page() {
  return (
    <ContentManager
      posts={samplePosts}
      announcements={sampleAnnouncements}
      gallery={sampleGallery}
      demo
    />
  );
}
