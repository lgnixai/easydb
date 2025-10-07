import { ObsidianLayout } from "@/components/ObsidianLayout";
import FullFeaturedDemo from "@/components/FullFeaturedDemo";

const Index = () => {
  const url = new URL(window.location.href);
  const direct = url.searchParams.get("view");
  const tableId = url.searchParams.get("tableId") || undefined;
  if (direct === "grid") {
    return <FullFeaturedDemo tableId={tableId} />;
  }
  return <ObsidianLayout />;
};

export default Index;
