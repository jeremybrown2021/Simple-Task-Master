import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Trash2, Mail, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  async function onSubmit(data: InsertUser) {
    try {
      await createUser.mutateAsync(data);
      form.reset();
      toast({ title: "User created", description: "Team member added successfully." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this user? This will affect their assigned tasks.")) {
      deleteUser.mutate(id, {
        onSuccess: () => toast({ title: "User deleted" }),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="max-w-2xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createUser.isPending} className="h-11 px-6">
                  {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add User"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users?.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-all group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{user.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
