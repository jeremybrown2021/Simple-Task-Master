import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Overview() {
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) return null;

  const total = tasks?.length || 0;
  const completed = tasks?.filter(t => t.status === 'done').length || 0;
  const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const todo = tasks?.filter(t => t.status === 'todo').length || 0;
  const highPriority = tasks?.filter(t => t.priority === 'high' && t.status !== 'done').length || 0;

  const data = [
    { name: 'Done', value: completed, color: 'hsl(142.1 76.2% 36.3%)' }, // green-600
    { name: 'In Progress', value: inProgress, color: 'hsl(221.2 83.2% 53.3%)' }, // blue-600
    { name: 'To Do', value: todo, color: 'hsl(215.4 16.3% 46.9%)' }, // slate-500
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? Math.round((completed / total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriority}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-4 ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.createdAt ? format(new Date(task.createdAt), "PPP p") : "Just now"}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground capitalize">
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
              {(!tasks || tasks.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
             {data.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                 No data to display
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
