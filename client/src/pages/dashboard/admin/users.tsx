import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  AlertCircle, 
  User, 
  Check, 
  X, 
  UserCheck, 
  Stethoscope, 
  Shield,
  Mail,
  Calendar,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// User type extended with additional information
type EnhancedUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  profileImage?: string;
  createdAt: string;
  isActive: boolean;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);

  // Fetch users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<EnhancedUser[]>({
    queryKey: ["/api/users"],
  });

  // Handle user status toggle
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/status`, { isActive });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'}`,
        description: `${updatedUser.firstName} ${updatedUser.lastName} ha sido ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente.`,
      });
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser({ ...selectedUser, isActive: updatedUser.isActive });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  function toggleUserStatus(user: EnhancedUser) {
    toggleUserStatusMutation.mutate({ 
      userId: user.id, 
      isActive: !user.isActive 
    });
  }

  function viewUserDetails(user: EnhancedUser) {
    setSelectedUser(user);
    setOpenUserDetails(true);
  }

  // Filter users by search term, user type and status
  const filteredUsers = users
    ?.filter(user => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    })
    .filter(user => {
      if (userTypeFilter === "all") return true;
      return user.userType === userTypeFilter;
    })
    .filter(user => {
      if (statusFilter === "all") return true;
      return user.isActive === (statusFilter === "active");
    });

  // Get user type icon
  function getUserTypeIcon(userType: string) {
    switch (userType) {
      case UserType.PATIENT:
        return <UserCheck className="h-4 w-4" />;
      case UserType.DOCTOR:
        return <Stethoscope className="h-4 w-4" />;
      case UserType.ADMIN:
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  }

  // Get human-readable user type
  function getUserTypeLabel(userType: string) {
    switch (userType) {
      case UserType.PATIENT:
        return "Paciente";
      case UserType.DOCTOR:
        return "Médico";
      case UserType.ADMIN:
        return "Administrador";
      default:
        return userType;
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-gray-500 mt-1">Administra todos los usuarios de la plataforma</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex items-center w-full sm:w-96">
              <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={UserType.PATIENT}>Pacientes</SelectItem>
                  <SelectItem value={UserType.DOCTOR}>Médicos</SelectItem>
                  <SelectItem value={UserType.ADMIN}>Administradores</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Error al cargar los usuarios. Intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className={cn(!user.isActive && "bg-gray-50")}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex">
                    <div className="relative">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                      {!user.isActive && (
                        <span className="absolute -top-1 -right-1 bg-red-100 border border-red-500 rounded-full p-0.5">
                          <X className="h-3 w-3 text-red-600" />
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-0.5">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Registrado: {format(new Date(user.createdAt), "PPP", { locale: es })}</span>
                      </div>
                      <div className="mt-2">
                        <Badge className={cn(
                          "flex items-center w-fit",
                          user.userType === UserType.PATIENT && "bg-green-100 text-green-800",
                          user.userType === UserType.DOCTOR && "bg-blue-100 text-blue-800",
                          user.userType === UserType.ADMIN && "bg-purple-100 text-purple-800"
                        )}>
                          {getUserTypeIcon(user.userType)}
                          <span className="ml-1">{getUserTypeLabel(user.userType)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col sm:items-end justify-center">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewUserDetails(user)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Detalles
                      </Button>
                      <Button 
                        variant={user.isActive ? "destructive" : "default"} 
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                        disabled={toggleUserStatusMutation.isPending}
                      >
                        {toggleUserStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isActive ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
            <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
              No hay usuarios que coincidan con tus criterios de búsqueda.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setUserTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={openUserDetails} onOpenChange={setOpenUserDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información detallada de {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <>
              <div className="flex items-center space-x-4 mb-4">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center">
                    <span className="text-xl font-medium">
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <Badge className={cn(
                    "mt-2",
                    selectedUser.userType === UserType.PATIENT && "bg-green-100 text-green-800",
                    selectedUser.userType === UserType.DOCTOR && "bg-blue-100 text-blue-800",
                    selectedUser.userType === UserType.ADMIN && "bg-purple-100 text-purple-800"
                  )}>
                    {getUserTypeLabel(selectedUser.userType)}
                  </Badge>
                  <Badge className={cn(
                    "ml-2",
                    selectedUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {selectedUser.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre de Usuario</p>
                    <p>{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                    <p>{format(new Date(selectedUser.createdAt), "PPP", { locale: es })}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                  <p>{selectedUser.id}</p>
                </div>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUserDetails(false)}>
              Cerrar
            </Button>
            <Button 
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={() => {
                if (selectedUser) {
                  toggleUserStatus(selectedUser);
                  setOpenUserDetails(false);
                }
              }}
              disabled={toggleUserStatusMutation.isPending}
            >
              {toggleUserStatusMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : selectedUser?.isActive ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Desactivar Usuario
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Activar Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
