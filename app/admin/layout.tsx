"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setAutorizado(true);
      setVerificando(false);
    }

    verificarLogin();
  }, [router]);

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#263528]">
        <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-8 shadow-sm">
          Verificando acesso...
        </div>
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  return <>{children}</>;
}