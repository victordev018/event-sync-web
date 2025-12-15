import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addToast } = useToast();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Login Form
    const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema) as any
    });

    // Register Form
    const { register: registerReg, handleSubmit: handleSubmitReg, formState: { errors: errorsReg } } = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema) as any
    });

    const onLogin = async (data: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        setError("");
        try {
            const res = await api.post("/api/auth/login", data);
            login(res.data.token);
            addToast("Login realizado com sucesso!", "success");
            navigate("/dashboard");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Falha no login. Verifique suas credenciais.";
            setError(msg);
            addToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async (data: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        setError("");
        try {
            await api.post("/api/auth/register", data);
            addToast("Cadastro realizado com sucesso! Por favor, faça login.", "success");
            window.location.reload();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Falha no cadastro.";
            setError(msg);
            addToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
            <Button
                variant="ghost"
                className="absolute top-4 left-4 md:top-8 md:left-8"
                onClick={() => navigate("/")}
            >
                ← Voltar para Início
            </Button>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">EventSync</CardTitle>
                    <CardDescription>Sua porta de entrada para eventos incríveis</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Entrar</TabsTrigger>
                            <TabsTrigger value="register">Cadastrar</TabsTrigger>
                        </TabsList>

                        {error && <div className="mb-4 text-sm text-red-500 font-medium text-center">{error}</div>}

                        <TabsContent value="login">
                            <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
                                <Input label="E-mail" {...registerLogin("email")} error={errorsLogin.email?.message} />
                                <Input label="Senha" type="password" {...registerLogin("password")} error={errorsLogin.password?.message} />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleSubmitReg(onRegister)} className="space-y-4">
                                <Input label="Nome Completo" {...registerReg("name")} error={errorsReg.name?.message} />
                                <Input label="E-mail" {...registerReg("email")} error={errorsReg.email?.message} />
                                <Input label="Senha" type="password" {...registerReg("password")} error={errorsReg.password?.message} />

                                {/* <div className="space-y-2">
                                    <label className="text-sm font-medium">Função</label>
                                    <select {...registerReg("role")} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="USER">Usuário</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div> */}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Cadastrando..." : "Criar Conta"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
