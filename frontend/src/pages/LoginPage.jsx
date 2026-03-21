import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Wrench, ShieldCheck, ArrowRight, UserPlus, Phone, Lock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { login, register } from "../services/api";

const roleConfig = {
  customer: {
    icon: Leaf,
    bgGradient: "from-leaf/90 to-leaf/70",
    btnColor: "bg-leaf",
    textColor: "text-leaf",
    label: "Customer",
    gradientClass: "from-leaf to-leaf/80",
  },
  provider: {
    icon: Wrench,
    bgGradient: "from-clay/90 to-clay/70",
    btnColor: "bg-clay",
    textColor: "text-clay",
    label: "Provider",
    gradientClass: "from-clay to-clay/80",
  },
  admin: {
    icon: ShieldCheck,
    bgGradient: "from-soil/90 to-stone-900",
    btnColor: "bg-soil",
    textColor: "text-soil",
    label: "Admin",
    gradientClass: "from-soil to-soil/80",
  },
};

export default function LoginPage({ role = "customer" }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const config = roleConfig[role];
  const Icon = config.icon;
  
  const [isRegister, setIsRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  
  const [loginForm, setLoginForm] = useState({ phone: role === "admin" ? "admin" : "", pin: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    location: "",
    pin: "",
    serviceType: "electrician"
  });

  useEffect(() => {
    setLoginForm({ phone: role === "admin" ? "admin" : "", pin: "" });
    setIsRegister(false);
    setError("");
    setToast("");
  }, [role]);

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await login(loginForm.phone, loginForm.pin);

      if (role !== "admin" && data.user.role !== role) throw new Error(`Please use ${data.user.role} login page`);

      localStorage.setItem("seva_user", JSON.stringify(data.user));
      localStorage.setItem("seva_token", data.token);

      if (role === "customer") navigate("/customer/dashboard");
      else if (role === "provider") navigate("/provider/dashboard");
      else navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setBusy(true);
    setToast("");
    try {
      const payload = {
        name: registerForm.name,
        phone: registerForm.phone,
        pin: registerForm.pin,
        role: role,
        location: registerForm.location
      };

      if (role === "provider") {
        payload.service_type = registerForm.serviceType;
      }

      const data = await register(payload);

      setToast("Registration successful! Please login with your credentials.");
      setIsRegister(false);
      setRegisterForm({ name: "", phone: "", location: "", pin: "", serviceType: "electrician" });
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
      setTimeout(() => setToast(""), 3000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 ${config.btnColor} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl text-stone-800">SevaSetu</h1>
          <p className="mt-2 text-stone-500 text-lg">
            {isRegister ? `Register as ${config.label}` : `${config.label} Login`}
          </p>
        </div>

        {toast && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-600 border border-green-100">
            {toast}
          </div>
        )}

        {isRegister ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
            <form onSubmit={handleRegister} className="space-y-5">
              {role !== "admin" && (
                <>
                  <div>
                    <label className="text-sm font-bold text-stone-700">
                      {role === "provider" ? "Business Name" : "Full Name"}
                    </label>
                    <input 
                      className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 focus:border-stone-400 focus:outline-none" 
                      placeholder={role === "provider" ? "Suresh Electric Works" : "Your full name"} 
                      value={registerForm.name} 
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-stone-700">Phone Number</label>
                    <input 
                      className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 focus:border-stone-400 focus:outline-none" 
                      placeholder="9000000001" 
                      value={registerForm.phone} 
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} 
                      required 
                    />
                  </div>

                  {role === "provider" && (
                    <div>
                      <label className="text-sm font-bold text-stone-700">Service Type</label>
                      <select 
                        className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 focus:border-stone-400 focus:outline-none"
                        value={registerForm.serviceType}
                        onChange={(e) => setRegisterForm({ ...registerForm, serviceType: e.target.value })}
                      >
                        <option value="electrician">Electrician</option>
                        <option value="plumber">Plumber</option>
                        <option value="mechanic">Mechanic</option>
                        <option value="tractor_rental">Tractor Rental</option>
                        <option value="pump_repair">Pump Repair</option>
                        <option value="medicines">Pharmacy</option>
                        <option value="fertilizers">Fertilizers</option>
                        <option value="seeds">Seeds</option>
                        <option value="pesticides">Pesticides</option>
                        <option value="tools">Tools</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold text-stone-700">Location</label>
                    <input 
                      className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 focus:border-stone-400 focus:outline-none" 
                      placeholder="Chilakaluripet" 
                      value={registerForm.location} 
                      onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })} 
                      required 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-bold text-stone-700">Create PIN (6 digits)</label>
                <input 
                  className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 tracking-widest focus:border-stone-400 focus:outline-none" 
                  type="password" 
                  placeholder="123456" 
                  value={registerForm.pin} 
                  onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value })} 
                  required 
                  maxLength={6} 
                />
              </div>

              <button 
                type="submit" 
                disabled={busy} 
                className={`w-full rounded-2xl ${config.btnColor} px-4 py-4 font-semibold text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2`}
              >
                {busy ? "Creating Account..." : `Register as ${config.label}`}
              </button>
              
              <button 
                type="button"
                onClick={() => setIsRegister(false)} 
                className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 font-semibold text-stone-600 hover:bg-stone-50"
              >
                Already have an account? Sign In
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
            <form onSubmit={handleLogin} className="space-y-5">
              {role !== "admin" && (
                <div>
                  <label className="text-sm font-bold text-stone-700">Phone Number</label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input 
                      className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 pl-12 focus:border-stone-400 focus:outline-none" 
                      placeholder="9000000001" 
                      value={loginForm.phone} 
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              )}

              {role === "admin" && (
                <div>
                  <label className="text-sm font-bold text-stone-700">Username</label>
                  <div className="relative mt-2">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input 
                      className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 pl-12 focus:border-stone-400 focus:outline-none bg-stone-50" 
                      placeholder="admin" 
                      value={loginForm.phone} 
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-stone-700">PIN / Password</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input 
                    className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 pl-12 tracking-widest focus:border-stone-400 focus:outline-none" 
                    type="password" 
                    placeholder="123456" 
                    value={loginForm.pin} 
                    onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })} 
                    required 
                    maxLength={6} 
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={busy} 
                className={`w-full rounded-2xl ${config.btnColor} px-4 py-4 font-semibold text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2`}
              >
                {busy ? "Signing in..." : t("signIn")}
                {!busy && <ArrowRight className="w-5 h-5" />}
              </button>

              {role !== "admin" && (
                <button 
                  type="button"
                  onClick={() => setIsRegister(true)} 
                  className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 font-semibold text-stone-600 hover:bg-stone-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" /> Register as {config.label}
                </button>
              )}
            </form>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => navigate("/login/customer")} className={`text-sm ${role === "customer" ? "font-bold text-leaf" : "text-stone-500"}`}>{t("customerLogin")}</button>
          <span className="text-stone-300">|</span>
          <button onClick={() => navigate("/login/provider")} className={`text-sm ${role === "provider" ? "font-bold text-clay" : "text-stone-500"}`}>{t("providerLogin")}</button>
          <span className="text-stone-300">|</span>
          <button onClick={() => navigate("/login/admin")} className={`text-sm ${role === "admin" ? "font-bold text-soil" : "text-stone-500"}`}>{t("adminLogin")}</button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => i18n.changeLanguage("en")} className={`px-3 py-1 text-sm rounded ${i18n.language === "en" ? "bg-stone-800 text-white" : "bg-white"}`}>EN</button>
          <button onClick={() => i18n.changeLanguage("te")} className={`px-3 py-1 text-sm rounded ${i18n.language === "te" ? "bg-stone-800 text-white" : "bg-white"}`}>TE</button>
          <button onClick={() => i18n.changeLanguage("hi")} className={`px-3 py-1 text-sm rounded ${i18n.language === "hi" ? "bg-stone-800 text-white" : "bg-white"}`}>HI</button>
        </div>
      </div>
    </div>
  );
}
