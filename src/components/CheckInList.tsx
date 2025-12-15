import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { getSubscriptions, performCheckIn } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { Search, CheckCircle } from "lucide-react";

interface Subscription {
    userId: string;
    userName: string;
    userEmail: string;
    checkedIn: boolean;
    subscriptionDate: string;
}

interface CheckInListProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
}

export function CheckInList({ isOpen, onClose, eventId }: CheckInListProps) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { addToast } = useToast();

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await getSubscriptions(eventId);
            setSubscriptions(response.data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar lista de inscritos.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && eventId) {
            fetchSubscriptions();
        }
    }, [isOpen, eventId]);

    const handleCheckIn = async (userId: string) => {
        try {
            await performCheckIn(eventId, userId);

            // Optimistic update
            setSubscriptions(prev => prev.map(sub =>
                sub.userId === userId ? { ...sub, checkedIn: true } : sub
            ));

            addToast("Check-in realizado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao realizar check-in.", "error");
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gerenciar Check-in"
            className="max-w-[600px] flex flex-col p-6 overflow-hidden max-h-[85vh]"
        >
            <div className="flex flex-col h-full gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar participante por nome ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 border rounded-md p-2 bg-muted/10 h-[50vh]">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "Nenhum participante encontrado." : "Nenhum inscrito neste evento."}
                        </div>
                    ) : (
                        filteredSubscriptions.map((sub) => (
                            <div key={sub.userId} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {sub.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-medium truncate max-w-[150px] sm:max-w-xs">{sub.userName}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs">{sub.userEmail}</div>
                                    </div>
                                </div>

                                {sub.checkedIn ? (
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium border border-green-100 whitespace-nowrap">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Confirmado</span>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handleCheckIn(sub.userId)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                                    >
                                        Check-in
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
                    <span>Total: {filteredSubscriptions.length}</span>
                    <span>Confirmados: {filteredSubscriptions.filter(s => s.checkedIn).length}</span>
                </div>
            </div>
        </Modal>
    );
}
