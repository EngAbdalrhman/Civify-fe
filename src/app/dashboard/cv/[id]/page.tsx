"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDatabase } from "@/hooks/use-database";
import { useAuth } from "@/context/auth-context";
import { CVData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/app/Loader";

export default function CVViewPage({ params }: { params: { id: string } }) {
  const { user, isHydrated } = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
      return;
    }
    if (database && params.id) {
      database.getCVData(params.id)
        .then((data) => {
          setCv(data);
        })
        .finally(() => setLoading(false));
    }
  }, [user, isHydrated, database, params.id, router]);

  if (loading) return <Loader message="Loading CV..." />;
  if (!cv) return <div className="p-8 text-center">CV not found.</div>;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{cv.fileName}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">{cv.rawText}</pre>
        {/* You can add more detailed rendering of structuredData/profile here */}
      </CardContent>
    </Card>
  );
}
