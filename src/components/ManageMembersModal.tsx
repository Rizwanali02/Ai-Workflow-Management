"use client";
import { useState, useEffect } from "react";
import { 
  Users, 
  X, 
  Plus, 
  UserPlus, 
  Loader2, 
  Check, 
  ShieldCheck,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";
interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: string[];
  onSuccess: () => void;
}
export default function ManageMembersModal({ 
  isOpen, 
  onClose, 
  projectId, 
  currentMembers,
  onSuccess 
}: ManageMembersModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedMembers(currentMembers);
    }
  }, [isOpen, currentMembers]);
  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await axios.get("/api/users");
      if (res.data) {
        setUsers(res.data); 
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setFetching(false);
    }
  };
  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.patch(`/api/projects/${projectId}`, { members: selectedMembers });
      if (res.data) {
        toast.success("Project members updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update members");
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                <Users className="w-5 h-5" />
             </div>
             <DialogTitle className="text-xl font-bold">Manage Team</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500">
            Add or remove employees from this project. They will be able to see and participate in discussions.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px] pr-4">
            {fetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">No users found.</div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div 
                    key={user._id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedMembers.includes(user._id) 
                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800' 
                        : 'bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
                    }`}
                    onClick={() => toggleMember(user._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedMembers.includes(user._id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-[10px] text-slate-500 lowercase">{user.role} • {user.email}</div>
                      </div>
                    </div>
                    {selectedMembers.includes(user._id) ? (
                      <div className="bg-indigo-600 rounded-full p-1 text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <Plus className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {selectedMembers.length} team members selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleUpdate} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
