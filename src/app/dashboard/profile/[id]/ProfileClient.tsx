"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Shield, User as UserIcon, Calendar, Camera, Trash2, Edit } from "lucide-react";
import { updateProfile, updateUserRole, softDeleteUser } from "@/actions/user";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function ProfileClient({ 
  user, 
  isOwnProfile, 
  isAdmin 
}: { 
  user: any; 
  isOwnProfile: boolean; 
  isAdmin: boolean; 
}) {
  const router = useRouter();
  const { user: currentUser, login } = useAuth();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [role, setRole] = useState(user.role);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      let profileImgUrl = user.profileImg;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await axios.post("/api/upload", formData);
        profileImgUrl = uploadRes.data.secure_url;
      }

      const res = await updateProfile(user._id, { name, profileImg: profileImgUrl });
      
      if (res.success) {
        toast.success("Profile updated successfully!");
        setIsEditOpen(false);
        if (isOwnProfile && currentUser) {
            login({ ...currentUser, name, profileImg: profileImgUrl } as any);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async () => {
    setIsUpdating(true);
    try {
      const res = await updateUserRole(user._id, role);
      if (res.success) {
        toast.success("Role updated successfully!");
        setIsRoleOpen(false);
        if (isOwnProfile && currentUser) {
            login({ ...currentUser, role } as any);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsUpdating(true);
    try {
      const res = await softDeleteUser(user._id);
      if (res.success) {
        toast.success("User deleted successfully!");
        setIsDeleteOpen(false);
        router.push("/dashboard/team");
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  if (user.isDeleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <Trash2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Deleted</h2>
        <p className="text-slate-500 mt-2">This user account has been deactivated.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/dashboard/team")}>
          Back to Team
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-slate-500">View and manage account information.</p>
        </div>
        
        <div className="flex gap-2">
          {isOwnProfile && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Avatar className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/30">
                        {previewUrl || user.profileImg ? (
                           <AvatarImage src={previewUrl || user.profileImg} alt={name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-indigo-600 text-white text-3xl font-bold">
                            {name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                    <p className="text-xs text-slate-500">Click avatar to change image</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {isUpdating ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {isAdmin && !isOwnProfile && (
            <>
              <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                      Update {user.name}'s permission level in the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRoleOpen(false)} disabled={isUpdating}>
                      Cancel
                    </Button>
                    <Button onClick={handleRoleChange} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {isUpdating ? "Saving..." : "Save Role"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {user.name}? This will deactivate their account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isUpdating}>
                      Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} disabled={isUpdating} variant="destructive">
                      {isUpdating ? "Deleting..." : "Delete User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 h-fit">
            <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-indigo-100 dark:border-indigo-900/30">
                  {user.profileImg ? (
                    <AvatarImage src={user.profileImg} alt={user.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-indigo-600 text-white text-3xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <Badge className="mt-2 capitalize" variant="outline">{user.role}</Badge>
            </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Official information registered with the organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Full Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Email Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Current Role</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{user.role}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Joined Date</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
