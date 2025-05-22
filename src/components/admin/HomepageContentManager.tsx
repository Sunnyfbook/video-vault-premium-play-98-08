
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { X, Image, Video, Instagram } from "lucide-react";
import { isInstagramPostUrl } from "@/utils/instagramUtils";

const defaultFormState = {
  title: "",
  description: "",
  url: "",
  thumbnail: "",
  type: "video" as "video" | "image" | "instagram",
  display_order: 0,
};

const HomepageContentManager: React.FC = () => {
  const { content, loading, error } = useHomepageContent();
  const [form, setForm] = useState({ ...defaultFormState });
  const [tab, setTab] = useState<"video" | "image">("video");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (!form.url.trim() || !form.title.trim()) {
      toast({
        title: "Title and URL are required.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }
    
    // Check if it's an Instagram URL
    const isInstagram = isInstagramPostUrl(form.url);
    const contentType = isInstagram ? "instagram" : form.type;
    
    // If it's an Instagram URL but invalid, show error
    if (form.url.includes('instagram') && !isInstagram) {
      toast({
        title: "Invalid Instagram URL",
        description: "Please enter a valid Instagram post or reel URL",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }
    
    const { error } = await supabase.from("homepage_content").insert([
      {
        title: form.title,
        url: form.url,
        type: contentType,
        description: form.description,
        thumbnail: form.type === "video" ? form.thumbnail : form.url, // Use url as thumbnail if type is image
        display_order: Number(form.display_order) || 0,
      },
    ]);
    
    setSaving(false);
    
    if (error) {
      console.error("Error adding content:", error);
      toast({
        title: "Error adding content",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setForm({ ...defaultFormState, type: tab });
    toast({
      title: isInstagram 
        ? "Instagram content added"
        : `${form.type === "video" ? "Video" : "Image"} added`,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    
    const { error } = await supabase.from("homepage_content").delete().eq("id", id);
    
    if (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Item deleted" });
    }
  };

  const handleTabChange = (val: string) => {
    setTab(val as "video" | "image");
    setForm({ ...defaultFormState, type: val as "video" | "image" });
  };

  // Show error if there was an issue fetching content
  if (error) {
    return (
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Content</CardTitle>
          <CardDescription>
            There was a problem loading the homepage content: {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </CardContent>
      </Card>
    );
  }

  // Group videos and Instagram reels together, images and Instagram posts together
  const videoContent = content.filter(item => 
    item.type === "video" || (item.type === "instagram" && item.url.includes("/reel"))
  );
  
  const imageContent = content.filter(item => 
    item.type === "image" || (item.type === "instagram" && !item.url.includes("/reel"))
  );

  return (
    <div>
      <Tabs defaultValue="video" value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="video">
            <Video size={16} className="mr-2" /> Videos
          </TabsTrigger>
          <TabsTrigger value="image">
            <Image size={16} className="mr-2" /> Images
          </TabsTrigger>
        </TabsList>
        <TabsContent value="video">
          <AddForm form={form} setForm={setForm} onSubmit={handleAdd} saving={saving} type="video" />
          <ListSection items={videoContent} type="video" onDelete={handleDelete} loading={loading} />
        </TabsContent>
        <TabsContent value="image">
          <AddForm form={form} setForm={setForm} onSubmit={handleAdd} saving={saving} type="image" />
          <ListSection items={imageContent} type="image" onDelete={handleDelete} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AddForm: React.FC<{
  form: typeof defaultFormState;
  setForm: React.Dispatch<React.SetStateAction<typeof defaultFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  type: "video" | "image";
}> = ({ form, setForm, onSubmit, saving, type }) => {
  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle>
          Add {type === "video" ? "Video" : "Image"}
        </CardTitle>
        <CardDescription>
          {type === "video"
            ? "Add a video or Instagram reel to feature on the homepage."
            : "Add an image or Instagram post to feature on the homepage."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>{type === "video" ? "Video URL" : "Image URL"}</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              type="url"
              required
              placeholder={type === "video" 
                ? "e.g. https://example.com/video.mp4 or https://www.instagram.com/reel/abc123/" 
                : "e.g. https://example.com/image.jpg or https://www.instagram.com/p/abc123/"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Instagram URLs will be automatically recognized and embedded
            </p>
          </div>
          {type === "video" && (
            <div>
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                placeholder="e.g. https://example.com/thumb.jpg"
              />
            </div>
          )}
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div>
            <Label>Display Order</Label>
            <Input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((f) => ({ ...f, display_order: +e.target.value }))}
              min={0}
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Adding..." : `Add ${type === "video" ? "Video" : "Image"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ListSection: React.FC<{
  items: ReturnType<typeof useHomepageContent>["content"];
  type: "video" | "image";
  onDelete: (id: string) => void;
  loading: boolean;
}> = ({ items, type, onDelete, loading }) => {
  const getPreviewComponent = (item: ReturnType<typeof useHomepageContent>["content"][0]) => {
    if (item.type === "instagram") {
      return (
        <div className="w-24 h-16 rounded bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 flex items-center justify-center">
          <Instagram size={20} className="text-white" />
        </div>
      );
    } else if (type === "video") {
      return <video src={item.url} poster={item.thumbnail || ""} className="w-24 h-16 rounded object-cover" controls={false} />;
    } else {
      return <img src={item.url} alt={item.title} className="w-24 h-16 rounded object-cover" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "video" ? "Videos List" : "Images List"}
        </CardTitle>
        {!loading && (
          <CardDescription>
            {items.length === 0 ? (
              <>No {type === "video" ? "videos" : "images"} on homepage.</>
            ) : (
              <>Manage {type === "video" ? "videos" : "images"} currently shown on homepage.</>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-gray-400">No items to show.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-muted rounded-md p-3">
                {getPreviewComponent(item)}
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.type === "instagram" ? "Instagram " + (type === "video" ? "Reel" : "Post") : item.description}
                  </div>
                </div>
                <Button size="icon" variant="destructive" onClick={() => onDelete(item.id)}>
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomepageContentManager;
