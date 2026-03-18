import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Leaf, Pill, Tractor, Wrench, LogOut, Plus, MapPin, Clock, CheckCircle, XCircle, Star, History, Search, User, UserCircle } from "lucide-react";
import { acceptOffer, rejectOffer, completeRequest, createRequest, createRating, fetchProviders, fetchUsers } from "../services/api";

const MODULES = [
  { key: "service", label: "Local Services", icon: Wrench, color: "bg-clay/15 text-clay" },
  { key: "medicine", label: "Prescription Medicine", icon: Pill, color: "bg-leaf/15 text-leaf" },
  { key: "farm", label: "Farm Supplies", icon: Leaf, color: "bg-millet/35 text-soil" },
];

const SERVICE_TYPES = [
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "mechanic", label: "Mechanic" },
  { value: "tractor_rental", label: "Tractor Rental" },
  { value: "pump_repair", label: "Pump Repair" },
  { value: "medicines", label: "Medicines" },
  { value: "fertilizers", label: "Fertilizers" },
  { value: "seeds", label: "Seeds" },
  { value: "pesticides", label: "Pesticides" },
  { value: "tools", label: "Tools" },
];

export default function CustomerDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [form, setForm] = useState({ category: "service", service_type: "electrician", product_name: "", quantity: "", description: "", location: "Chilakaluripet", latitude: "16.0898", longitude: "80.1670", preferred_time: "Today evening" });
  const [myRequests, setMyRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: "" });
  const [selectedCompleted, setSelectedCompleted] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("seva_user") || "{}");
    if (!savedUser.phone) { navigate("/login/customer"); return; }
    setUser(savedUser);
    loadData(savedUser.id);
  }, []);

  useEffect(() => {
    const filtered = providers.filter(p => 
      p.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchTerm, providers]);

  async function loadData(userId) {
    try {
      const [allUsers, allProviders] = await Promise.all([fetchUsers(), fetchProviders()]);
      setUsers(allUsers);
      setProviders(allProviders);
      setFilteredProviders(allProviders);
      const myUser = allUsers.find(u => u.phone === user?.phone);
      if (myUser) loadMyRequests(myUser.id);
    } catch { }
  }

  async function loadMyRequests(userId) {
    try {
      const res = await fetch(`http://localhost:8000/api/my-requests/?user_id=${userId}&user_role=customer`);
      const data = await res.json();
      setMyRequests(data.filter(r => r.status !== "completed"));
      setCompletedRequests(data.filter(r => r.status === "completed"));
    } catch { }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleCreateRequest(e) {
    e.preventDefault();
    try {
      const savedUser = JSON.parse(localStorage.getItem("seva_user") || "{}");
      const myUser = users.find(u => u.phone === savedUser.phone);
      if (!myUser) { showToast("User not found"); return; }
      
      const payload = { user: myUser.id, ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
      const req = await createRequest(payload);
      setCreatedRequest(req);
      showToast(t("postRequest") + " #" + req.id);
      loadMyRequests(myUser.id);
      setForm({ category: "service", service_type: "electrician", product_name: "", quantity: "", description: "", location: "Chilakaluripet", latitude: "16.0898", longitude: "80.1670", preferred_time: "Today evening" });
    } catch (error) { showToast("Error creating request"); }
  }

  async function loadOffers(requestId) {
    try {
      const res = await fetch(`http://localhost:8000/api/request/${requestId}/offers/`);
      const data = await res.json();
      setOffers(data);
    } catch { }
  }

  useEffect(() => { if (createdRequest) loadOffers(createdRequest.id); }, [createdRequest]);

  async function handleAcceptOffer(offerId) {
    try { await acceptOffer(offerId); showToast("Offer accepted!"); loadOffers(createdRequest.id); } catch { showToast("Error"); }
  }

  async function handleRejectOffer(offerId) {
    try { await rejectOffer(offerId); showToast("Offer rejected"); loadOffers(createdRequest.id); } catch { showToast("Error"); }
  }

  async function handleComplete() {
    if (!createdRequest) return;
    try { 
      await completeRequest(createdRequest.id); 
      showToast("Request completed!"); 
      const savedUser = JSON.parse(localStorage.getItem("seva_user") || "{}");
      const myUser = users.find(u => u.phone === savedUser.phone);
      if (myUser) loadMyRequests(myUser.id);
      
      const acceptedOffer = offers.find(o => o.status === "accepted");
      if (acceptedOffer) {
        setSelectedCompleted({ ...createdRequest, acceptedOffer });
        setShowRatingModal(true);
      }
      setCreatedRequest(null); 
      setOffers([]); 
    } catch { showToast("Error"); }
  }

  async function handleSubmitRating(e) {
    e.preventDefault();
    if (!selectedCompleted) return;
    try {
      await createRating({
        request: selectedCompleted.id,
        provider: selectedCompleted.acceptedOffer.provider_id,
        rating: ratingForm.rating,
        review: ratingForm.review
      });
      showToast("Thank you for your rating!");
      setShowRatingModal(false);
      setRatingForm({ rating: 5, review: "" });
      setSelectedCompleted(null);
    } catch { showToast("Error submitting rating"); }
  }

  function handleLogout() { localStorage.removeItem("seva_user"); localStorage.removeItem("seva_token"); navigate("/login/customer"); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-leaf/5">
      {toast && (
        <div className="fixed left-1/2 top-4 -translate-x-1/2 z-50 rounded-xl bg-soil px-6 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {showRatingModal && selectedCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Rate Your Experience</h3>
              <p className="text-stone-500 mb-4">How was your experience with {selectedCompleted.acceptedOffer.provider_name}?</p>
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                      className="p-1"
                    >
                      <Star className={`w-10 h-10 ${star <= ratingForm.rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-700">Review (optional)</label>
                  <textarea
                    className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 focus:border-leaf focus:outline-none"
                    placeholder="Share your experience..."
                    rows={3}
                    value={ratingForm.review}
                    onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-leaf px-4 py-3 font-semibold text-white">
                  Submit Rating
                </button>
                <button type="button" onClick={() => setShowRatingModal(false)} className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 font-semibold text-stone-600">
                  Skip
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <nav className="bg-white shadow-sm border-b border-stone-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl text-leaf">SevaSetu</h1>
              <p className="text-xs text-stone-500">{t("consumer")}: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button onClick={() => i18n.changeLanguage("en")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "en" ? "bg-leaf text-white" : "bg-stone-100"}`}>EN</button>
              <button onClick={() => i18n.changeLanguage("te")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "te" ? "bg-leaf text-white" : "bg-stone-100"}`}>TE</button>
              <button onClick={() => i18n.changeLanguage("hi")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${i18n.language === "hi" ? "bg-leaf text-white" : "bg-stone-100"}`}>HI</button>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab("new")} className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${activeTab === "new" ? "bg-leaf text-white" : "bg-white border border-stone-200"}`}>
            <Plus className="w-4 h-4" /> New Request
          </button>
          <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${activeTab === "history" ? "bg-leaf text-white" : "bg-white border border-stone-200"}`}>
            <History className="w-4 h-4" /> My Requests
          </button>
          <button onClick={() => setActiveTab("providers")} className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${activeTab === "providers" ? "bg-leaf text-white" : "bg-white border border-stone-200"}`}>
            <Search className="w-4 h-4" /> Browse Providers
          </button>
          <button onClick={() => setActiveTab("profile")} className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${activeTab === "profile" ? "bg-leaf text-white" : "bg-white border border-stone-200"}`}>
            <UserCircle className="w-4 h-4" /> My Profile
          </button>
        </div>

        {activeTab === "new" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-leaf to-leaf/80 px-6 py-4">
                  <h2 className="font-display text-xl text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" /> {t("postRequest")}
                  </h2>
                </div>
                <form onSubmit={handleCreateRequest} className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    {MODULES.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setForm({ ...form, category: item.key })}
                        className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${form.category === item.key ? "border-leaf bg-leaf text-white" : "border-stone-200 bg-white text-stone-600 hover:border-leaf/50"}`}
                      >
                        <item.icon className="mx-auto mb-2 h-6 w-6" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase">Service Type</label>
                      <select 
                        className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 focus:border-leaf focus:outline-none"
                        value={form.service_type}
                        onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                      >
                        {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase">{t("location")}</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input 
                          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 pl-10 focus:border-leaf focus:outline-none" 
                          value={form.location} 
                          onChange={(e) => setForm({ ...form, location: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">{t("description")}</label>
                    <textarea
                      className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 focus:border-leaf focus:outline-none"
                      placeholder="Describe your requirement..."
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  
                  <button className="w-full rounded-xl bg-leaf px-4 py-4 font-semibold text-white text-lg hover:bg-leaf/90 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Submit Request
                  </button>
                </form>
              </div>

              {createdRequest && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-clay to-clay/80 px-6 py-4 flex justify-between items-center">
                    <h2 className="font-display text-xl text-white">{t("offersComparison")}</h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">Request #{createdRequest.id}</span>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between rounded-xl border-2 border-stone-200 p-4 hover:border-leaf/30 transition-colors">
                          <div>
                            <p className="font-bold text-stone-800">{offer.provider_name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${offer.status === "pending" ? "bg-amber-100 text-amber-700" : offer.status === "accepted" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>
                                {offer.status}
                              </span>
                              <span className="text-xs text-stone-500 flex items-center gap-1"><Clock className="w-3 h-3" /> ETA: {offer.eta_minutes} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-2xl text-leaf">₹{offer.price}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAcceptOffer(offer.id)} 
                                disabled={offer.status !== "pending"}
                                className="flex items-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-30"
                              >
                                <CheckCircle className="w-4 h-4" /> Accept
                              </button>
                              <button 
                                onClick={() => handleRejectOffer(offer.id)} 
                                disabled={offer.status !== "pending"}
                                className="flex items-center gap-1 rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {offers.length === 0 && (
                        <div className="text-center py-8 text-stone-500">
                          <p>Waiting for providers to respond...</p>
                        </div>
                      )}
                    </div>
                    {offers.some(o => o.status === "accepted") && (
                      <button onClick={handleComplete} className="mt-4 w-full rounded-xl bg-soil px-4 py-3 font-semibold text-white">
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-soil to-soil/80 px-6 py-4">
                  <h2 className="font-display text-lg text-white">{t("myRequests")}</h2>
                </div>
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {myRequests.length === 0 ? (
                    <p className="text-sm text-stone-500 text-center py-4">{t("noRequests")}</p>
                  ) : (
                    myRequests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => setCreatedRequest(req)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition-all ${createdRequest?.id === req.id ? "border-leaf bg-leaf/10" : "border-stone-200 hover:border-leaf/30"}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-stone-800">#{req.id} - {req.category}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === "open" ? "bg-blue-100 text-blue-700" : req.status === "assigned" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-soil to-soil/80 px-6 py-4">
              <h2 className="font-display text-xl text-white">Request History</h2>
            </div>
            <div className="p-6">
              {completedRequests.length === 0 ? (
                <p className="text-stone-500 text-center py-8">No completed requests yet</p>
              ) : (
                <div className="space-y-4">
                  {completedRequests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-stone-200 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-stone-800">#{req.id} - {req.category}</p>
                          <p className="text-sm text-stone-500">{req.description || "No description"}</p>
                          <p className="text-xs text-stone-400 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "providers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 pl-12 focus:border-leaf focus:outline-none"
                  placeholder="Search providers by name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.filter(p => p.is_active).map((provider) => (
                <div key={provider.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-leaf/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-leaf" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800">{provider.user_name}</p>
                      <p className="text-sm text-stone-500">{provider.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{provider.rating || "New"}</span>
                    </div>
                    <span className="text-sm text-stone-500">{provider.distance_km || 0} km</span>
                  </div>
                </div>
              ))}
              {filteredProviders.filter(p => p.is_active).length === 0 && (
                <div className="col-span-full text-center py-8 text-stone-500">
                  No providers found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-leaf to-leaf/80 px-6 py-4">
                <h2 className="font-display text-xl text-white">My Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-leaf/10 rounded-full flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-leaf" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800">{user?.name}</h3>
                    <p className="text-stone-500">{user?.role === "customer" ? "Customer" : "Provider"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-500">Phone</span>
                    <span className="font-semibold">{user?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-500">Location</span>
                    <span className="font-semibold">{user?.location || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-500">Total Requests</span>
                    <span className="font-semibold">{myRequests.length + completedRequests.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-stone-500">Completed</span>
                    <span className="font-semibold text-green-600">{completedRequests.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
