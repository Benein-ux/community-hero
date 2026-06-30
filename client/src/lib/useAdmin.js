import { useEffect, useState } from "react";
import { useAuth } from "./firebase";
import { api } from "./api";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    api.get(`/api/users/${user.uid}`).then((res) => {
      setIsAdmin(res.success ? !!res.data.isAdmin : false);
      setLoading(false);
    });
  }, [user]);

  return { isAdmin, loading };
}
