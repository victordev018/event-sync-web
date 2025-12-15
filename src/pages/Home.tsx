import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import type { Event } from "../types";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: events, isLoading, error } = useQuery<Event[]>({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await api.get('/api/events');
            return res.data;
        }
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Simple Navbar for Home */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">EventSync</h1>
                    <div className="flex gap-4 items-center">
                        {user ? (
                            <>
                                <span className="text-sm font-medium">Olá, {user.name}</span>
                                <Button variant="default" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                            </>
                        ) : (
                            <Button onClick={() => navigate('/login')}>Entrar / Cadastrar</Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-primary text-primary-foreground py-20 px-4 text-center">
                <h2 className="text-4xl font-extrabold mb-4">Descubra Eventos Incríveis</h2>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                    Participe da nossa comunidade para encontrar workshops, conferências e encontros feitos para você.
                </p>
                {!user && (
                    <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
                        Começar Agora
                    </Button>
                )}
            </div>

            <main className="container mx-auto px-4 py-8">
                <h3 className="text-2xl font-bold mb-6">Próximos Eventos</h3>

                {isLoading && <div className="text-center py-10">Carregando eventos...</div>}
                {error && <div className="text-center py-10 text-red-500">Falha ao carregar eventos.</div>}

                {events?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-muted-foreground">Nenhum evento encontrado no momento.</p>
                        <p className="text-sm text-muted-foreground mt-2">Volte mais tarde para conferir as novidades!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events?.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onSubscribe={() => user ? navigate('/dashboard') : navigate('/login')}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
