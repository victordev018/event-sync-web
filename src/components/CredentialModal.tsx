import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import QRCode from "react-qr-code";

interface CredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventName: string;
    userName: string;
    eventId: string;
    userId: string;
    checkedIn?: boolean;
}

export function CredentialModal({ isOpen, onClose, eventName, userName, eventId, userId, checkedIn }: CredentialModalProps) {
    const qrData = JSON.stringify({ eventId, userId });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={eventName}
            className="sm:max-w-[425px]"
        >
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">Participante</p>
                    <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <QRCode
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={qrData}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {checkedIn ? (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Presença Confirmada
                    </div>
                ) : (
                    <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        Check-in Pendente
                    </div>
                )}

                <Button onClick={onClose} className="w-full">
                    Fechar
                </Button>
            </div>
        </Modal>
    );
}
