import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, LogOut, Users, Wrench, FileText, CheckCircle, X, TrendingUp, Activity, Plus } from "lucide-react";
import { fetchDashboard, fetchUsers, fetchProviders, register } from "../services/api";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("provider");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    location: "",
    pin: "123456",
    service_type: "electrician",
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("seva_user") || "{}");
    if (!savedUser.phone) { navigate("/login/admin"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dash, allUsers, allProviders] = await Promise.all([fetchDashboard(), fetchUsers(), fetchProviders()]);
      setDashboard(dash);
      setUsers(allUsers);
      setProviders(allProviders);
    } catch { }
  }

  function handleLogout() { localStorage.removeItem("seva_user"); localStorage.removeItem("seva_token"); navigate("/login/admin"); }

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    setToast("");
    try {
      const payload = {
        name: createForm.name,
        phone: createForm.phone,
        pin: createForm.pin,
        role: createType,
        location: createForm.location
      };

      if (createType === "provider") {
        payload.service_type = createForm.service_type;
      }

      const data = await register(payload);

      setToast(`${createType === "provider" ? "Provider" : "Customer"} created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ name: "", phone: "", location: "", pin: "123456", service_type: "electrician" });
      loadData();
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
      setTimeout(() => setToast(""), 3000);
    }
  }

  const openCreateModal = (type) => {
    setCreateType(type);
    setCreateForm({ name: "", phone: "", location: "", pin: "123456", service_type: "electrician" });
    setShowCreateModal(true);
  };

  const customers = users.filter(u => u.role === "customer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-soil/5">
      {toast && (
        <div className="fixed left-1/2 top-4 -translate-x-1/2 z-50 rounded-xl bg-soil px-6 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Create New {createType === "provider" ? "Provider" : "Customer"}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-stone-700">
                  {createType === "provider" ? "Business Name" : "Full Name"}
                </label>
                <input 
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-soil focus:outline-none" 
                  placeholder={createType === "provider" ? "Suresh Electric Works" : "John Doe"}
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-700">Phone Number</label>
                <input 
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-soil focus:outline-none" 
                  placeholder={createType === "provider" ? "9100000001" : "9000000001"}
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-700">Location</label>
                <input 
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-soil focus:outline-none" 
                  placeholder="Chilakaluripet"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  required
                />
              </div>
              {createType === "provider" && (
                <div>
                  <label className="text-sm font-semibold text-stone-700">Service Type</label>
                  <select 
                    className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-soil focus:outline-none"
                    value={createForm.service_type}
                    onChange={(e) => setCreateForm({ ...createForm, service_type: e.target.value })}
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
                <label className="text-sm font-semibold text-stone-700">PIN</label>
                <input 
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-soil focus:outline-none" 
                  placeholder="123456"
                  value={createForm.pin}
                  onChange={(e) => setCreateForm({ ...createForm, pin: e.target.value })}
                  required
                  maxLength={6}
                />
              </div>
              <button 
                type="submit" 
                disabled={busy}
                className="w-full rounded-xl bg-soil px-4 py-3 font-semibold text-white hover:bg-soil/90 disabled:opacity-60"
              >
                {busy ? "Creating..." : `Create ${createType === "provider" ? "Provider" : "Customer"}`}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <nav className="bg-white shadow-sm border-b border-stone-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-soil rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl text-soil">SevaSetu Admin</h1>
              <p className="text-xs text-stone-500">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button onClick={() => i18n.changeLanguage("en")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "en" ? "bg-soil text-white" : "bg-stone-100"}`}>EN</button>
              <button onClick={() => i18n.changeLanguage("te")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "te" ? "bg-soil text-white" : "bg-stone-100"}`}>TE</button>
              <button onClick={() => i18n.changeLanguage("hi")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "hi" ? "bg-soil text-white" : "bg-stone-100"}`}>HI</button>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
              <h3 className="font-semibold text-stone-600 mb-4">Navigation</h3>
              <div className="space-y-2">
                <button onClick={() => setActiveTab("overview")} className={`w-full rounded-xl px-4 py-3 text-left font-medium flex items-center gap-3 ${activeTab === "overview" ? "bg-soil text-white" : "hover:bg-stone-100"}`}>
                  <Activity className="w-5 h-5" /> Overview
                </button>
                <button onClick={() => setActiveTab("customers")} className={`w-full rounded-xl px-4 py-3 text-left font-medium flex items-center gap-3 ${activeTab === "customers" ? "bg-soil text-white" : "hover:bg-stone-100"}`}>
                  <Users className="w-5 h-5" /> Customers
                </button>
                <button onClick={() => setActiveTab("providers")} className={`w-full rounded-xl px-4 py-3 text-left font-medium flex items-center gap-3 ${activeTab === "providers" ? "bg-soil text-white" : "hover:bg-stone-100"}`}>
                  <Wrench className="w-5 h-5" /> Providers
                </button>
                <button onClick={() => setActiveTab("requests")} className={`w-full rounded-xl px-4 py-3 text-left font-medium flex items-center gap-3 ${activeTab === "requests" ? "bg-soil text-white" : "hover:bg-stone-100"}`}>
                  <FileText className="w-5 h-5" /> Requests
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => openCreateModal("provider")}
                className="w-full rounded-2xl bg-soil px-4 py-3 font-semibold text-white hover:bg-soil/90 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Provider
              </button>
              <button 
                onClick={() => openCreateModal("customer")}
                className="w-full rounded-2xl bg-stone-600 px-4 py-3 font-semibold text-white hover:bg-stone-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Customer
              </button>
            </div>

            <div className="bg-gradient-to-br from-soil to-soil/80 rounded-2xl p-6 text-white">
              <h3 className="font-display text-lg mb-2">Quick Stats</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between"><span className="text-white/70">Total Users</span><span className="font-bold">{users.length}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Providers</span><span className="font-bold">{providers.length}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Active</span><span className="font-bold">{dashboard?.active_providers || 0}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {activeTab === "overview" && (
              <>
                {dashboard && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-stone-800">{dashboard.open_requests}</p>
                      <p className="text-sm text-stone-500">{t("openRequests")}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                      <div className="w-12 h-12 bg-clay/20 rounded-xl flex items-center justify-center mb-4">
                        <Wrench className="w-6 h-6 text-clay" />
                      </div>
                      <p className="text-3xl font-bold text-stone-800">{dashboard.active_providers}</p>
                      <p className="text-sm text-stone-500">{t("activeProviders")}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-stone-800">{dashboard.accepted_offers}</p>
                      <p className="text-sm text-stone-500">Accepted Offers</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                      <div className="w-12 h-12 bg-soil/20 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-soil" />
                      </div>
                      <p className="text-3xl font-bold text-stone-800">{dashboard.completed_requests}</p>
                      <p className="text-sm text-stone-500">{t("completedRequests")}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-leaf to-leaf/80 px-6 py-4 flex justify-between items-center">
                      <h2 className="font-display text-lg text-white flex items-center gap-2">
                        <Users className="w-5 h-5" /> {t("allCustomers")} ({customers.length})
                      </h2>
                      <button onClick={() => openCreateModal("customer")} className="bg-white/20 px-3 py-1 rounded-lg text-white text-xs hover:bg-white/30">+ Add</button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {customers.slice(0, 10).map((u) => (
                        <div key={u.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50">
                          <div>
                            <p className="font-semibold text-stone-800">{u.name}</p>
                            <p className="text-xs text-stone-500">{u.phone}</p>
                          </div>
                          <span className="px-3 py-1 bg-leaf/15 text-leaf text-xs font-semibold rounded-full">{t("consumer")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-clay to-clay/80 px-6 py-4 flex justify-between items-center">
                      <h2 className="font-display text-lg text-white flex items-center gap-2">
                        <Wrench className="w-5 h-5" /> {t("allProviders")} ({providers.length})
                      </h2>
                      <button onClick={() => openCreateModal("provider")} className="bg-white/20 px-3 py-1 rounded-lg text-white text-xs hover:bg-white/30">+ Add</button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {providers.slice(0, 10).map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50">
                          <div>
                            <p className="font-semibold text-stone-800">{p.user_name}</p>
                            <p className="text-xs text-stone-500">{p.service_type}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {p.is_active ? t("available") : t("notAvailable")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "customers" && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-leaf to-leaf/80 px-6 py-4 flex justify-between items-center">
                  <h2 className="font-display text-xl text-white">{t("allCustomers")} ({customers.length})</h2>
                  <button onClick={() => openCreateModal("customer")} className="bg-white/20 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-white/30 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Customer
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {customers.map((u) => (
                        <tr key={u.id} className="hover:bg-stone-50">
                          <td className="px-6 py-4 font-semibold text-stone-800">{u.name}</td>
                          <td className="px-6 py-4 text-stone-600 font-mono">{u.phone}</td>
                          <td className="px-6 py-4 text-stone-600">{u.location}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{u.rating || "New"}</span></td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "providers" && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-clay to-clay/80 px-6 py-4 flex justify-between items-center">
                  <h2 className="font-display text-xl text-white">{t("allProviders")} ({providers.length})</h2>
                  <button onClick={() => openCreateModal("provider")} className="bg-white/20 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-white/30 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Provider
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {providers.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="px-6 py-4 font-semibold text-stone-800">{p.user_name}</td>
                          <td className="px-6 py-4 text-stone-600">{p.service_type}</td>
                          <td className="px-6 py-4 text-stone-600">{p.provider_type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {p.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{p.rating || "New"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-soil to-soil/80 px-6 py-4">
                  <h2 className="font-display text-xl text-white">All Requests</h2>
                </div>
                <div className="p-6">
                  <p className="text-stone-500 text-center">Request analytics coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
