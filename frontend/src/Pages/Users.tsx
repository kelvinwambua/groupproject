import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../Components/ui/alert-dialog"
import { Button } from "../Components/ui/button"
import { useEffect, useState } from "react";
import { Trash2Icon, Download, FileText } from "lucide-react";
import { Badge } from "../Components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card"

export function Users() {
  const [authUser, setAuthUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/session', {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.loggedIn && data.user) {
        setAuthUser(data.user);
        setIsAuthenticated(true);
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      setAuthUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const exportPDF = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/report', {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  useEffect(() => {
    checkSession();
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Users Management</CardTitle>
              <CardDescription className="mt-2">
                Manage and view all registered users in the system
              </CardDescription>
            </div>
            <Button onClick={exportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                  {isAuthenticated && authUser && authUser.role === 'admin' && (
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      {isAuthenticated && authUser && authUser.role === 'admin' && (
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="gap-2">
                                <Trash2Icon className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{user.name}</strong>'s account? 
                                  This action cannot be undone and will permanently remove all data associated with this user.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={async () => {
                                    await fetch(`http://localhost:8000/api/users/${user.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                      }
                                    });
                                    fetchUsers();
                                  }}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{users.length}</strong> user{users.length !== 1 ? 's' : ''}
            </div>
            <div className="text-sm font-medium">
              Total Users: <span className="text-primary">{users.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}