import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: number;
  name: string;
  userType: string;
  profileImage?: string;
}

interface PatientSearchProps {
  onSelectUser: (userId: number, userType: string) => void;
  buttonLabel?: string;
  placeholder?: string;
  className?: string;
}

export function UserSearch({
  onSelectUser,
  buttonLabel = 'Iniciar chat',
  placeholder = 'Buscar usuario...',
  className = ''
}: PatientSearchProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);

  // Efecto para buscar usuarios cuando cambia la consulta
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      
      searchUsers(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Buscar usuarios en el servidor
  const searchUsers = async (searchQuery: string) => {
    try {
      setLoading(true);
      
      // Obtener el tipo de usuario opuesto al actual
      const searchUserType = user?.userType === 'doctor' ? 'patient' : 'doctor';
      
      const response = await apiRequest('GET', `/api/users/search?query=${encodeURIComponent(searchQuery)}&userType=${searchUserType}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar usuarios');
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los resultados de búsqueda',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de usuario
  const handleUserSelect = (result: SearchResult) => {
    setSelectedUser(result);
  };

  // Iniciar conversación con el usuario seleccionado
  const handleStartConversation = () => {
    if (!selectedUser) return;
    
    onSelectUser(selectedUser.id, selectedUser.userType);
    setSelectedUser(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>
      
      {loading ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="rounded-md border">
              <div className="divide-y">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedUser?.id === result.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleUserSelect(result)}
                  >
                    {result.profileImage ? (
                      <img
                        src={result.profileImage}
                        alt={result.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        {result.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.userType === 'doctor' ? 'Médico' : 'Paciente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query.trim().length >= 2 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No se encontraron resultados
            </p>
          ) : null}
        </>
      )}
      
      {selectedUser && (
        <div className="flex justify-end">
          <Button onClick={handleStartConversation}>
            {buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}