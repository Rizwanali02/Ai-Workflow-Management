"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
export function CreateTaskRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const handleAiEnhance = async () => {
    if (!title) return toast.error("Please enter a title first");
    setAiLoading(true);
    try {
      const res = await axios.post("/api/ai/generate-description", { title, type: "task" });
      if (res.data) {
        setDescription(res.data.description);
        toast.success("Description enhanced by AI");
      }
    } catch (error) {
      toast.error("AI enhancement failed");
    } finally {
      setAiLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.success("Task request submitted for approval");
    setLoading(false);
  };
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bug in login flow..." />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="desc">Description</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-indigo-600 hover:text-indigo-700 h-8"
            onClick={handleAiEnhance}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            AI Enhance
          </Button>
        </div>
        <Textarea 
            id="desc" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={6}
            placeholder="Detailed steps to reproduce..."
        />
      </div>
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Task Request"}
      </Button>
    </div>
  );
}
