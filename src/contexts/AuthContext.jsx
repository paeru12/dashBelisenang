"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

const router = useRouter();

const [user,setUser] = useState(null);

const login = async (email,password)=>{

```
const res = await api.post("/auth/admin/login",{
  email,
  password
});

setUser(res.data.user);

router.replace("/dashboard");
```

};

const logout = async ()=>{

```
try{
  await api.post("/auth/admin/logout");
}catch{}

setUser(null);

router.replace("/login");
```

};

return(

```
<AuthContext.Provider
  value={{
    user,
    isAuthenticated: !!user,
    login,
    logout
  }}
>
  {children}
</AuthContext.Provider>
```

);

}

export function useAuth(){

const ctx = useContext(AuthContext);

if(!ctx){
throw new Error("useAuth must be used inside AuthProvider");
}

return ctx;

}
