import ForumPage from "@/components/forum/ForumPage";
import { ForumProvider } from "@/contexts/ForumContext";

export default function Forum() {
  return (
    <ForumProvider>
      <ForumPage />
    </ForumProvider>
  );
}
