import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  useListLinks, 
  getListLinksQueryKey,
  useCreateLink, 
  useDeleteLink, 
  useGetStats,
  useGetLinkBookings,
  useGetLinkVisits
} from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { CopyIcon, Trash2Icon, LinkIcon, Users, CalendarHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const { data: stats } = useGetStats();
  const { data: links, isLoading: linksLoading } = useListLinks();
  
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();

  useEffect(() => {
    const token = localStorage.getItem("randka_adminToken");
    if (!token) {
      setLocation("/admin");
    }
  }, [setLocation]);

  const handleCreateLink = () => {
    createLink.mutate({ data: { customMessage } }, {
      onSuccess: (newLink) => {
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        setCustomMessage("");
        const shareUrl = `${window.location.origin}/l/${newLink.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link utworzony!",
          description: "URL został skopiowany do schowka.",
        });
      }
    });
  };

  const handleDeleteLink = (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć ten link?")) {
      deleteLink.mutate({ linkId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
          toast({
            title: "Link usunięty",
            description: "Pomyślnie usunięto link.",
          });
        }
      });
    }
  };

  const copyToClipboard = (id: string) => {
    const shareUrl = `${window.location.origin}/l/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Skopiowano!",
      description: "URL w schowku.",
    });
  };

  const openLinkDetails = (id: string) => {
    setSelectedLinkId(id);
    setIsLinkModalOpen(true);
  };

  return (
    <PageTransition className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ❤️</h1>
          <Button variant="outline" onClick={() => { localStorage.removeItem("randka_adminToken"); setLocation("/admin"); }}>
            Wyloguj
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center space-x-4 border-none shadow-sm">
            <div className="p-4 bg-rose-100 rounded-full text-rose-500">
              <LinkIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Utworzone linki</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalLinks || 0}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4 border-none shadow-sm">
            <div className="p-4 bg-blue-100 rounded-full text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Liczba wizyt</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalVisits || 0}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4 border-none shadow-sm">
            <div className="p-4 bg-green-100 rounded-full text-green-500">
              <CalendarHeart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Zgodzili się!</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</h3>
            </div>
          </Card>
        </div>

        {/* Create Link */}
        <Card className="p-6 border-none shadow-sm">
          <h2 className="text-xl font-bold mb-4">Utwórz nowy link</h2>
          <div className="flex gap-4">
            <Input 
              placeholder="Opcjonalna wiadomość..." 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleCreateLink} disabled={createLink.isPending} className="bg-rose-500 hover:bg-rose-600">
              {createLink.isPending ? "Tworzenie..." : "Utwórz i skopiuj"}
            </Button>
          </div>
        </Card>

        {/* Links Table */}
        <Card className="p-6 border-none shadow-sm overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Wszystkie linki</h2>
          {linksLoading ? (
            <div className="py-8 text-center text-gray-500">Ładowanie...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wiadomość</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead className="text-right">Wizyty</TableHead>
                  <TableHead className="text-right">Potwierdzenia</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links?.map((link) => (
                  <TableRow key={link.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openLinkDetails(link.id)}>
                    <TableCell className="font-medium">{link.customMessage || "Brak"}</TableCell>
                    <TableCell>{format(new Date(link.createdAt), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right">{link.visitCount}</TableCell>
                    <TableCell className="text-right">{link.yesCount}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.id)} title="Kopiuj URL">
                          <CopyIcon size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)} title="Usuń" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2Icon size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {links?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">Brak utworzonych linków.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        <LinkDetailsModal 
          linkId={selectedLinkId} 
          isOpen={isLinkModalOpen} 
          onClose={() => setIsLinkModalOpen(false)} 
        />
      </div>
    </PageTransition>
  );
}

function LinkDetailsModal({ linkId, isOpen, onClose }: { linkId: string | null, isOpen: boolean, onClose: () => void }) {
  const { data: bookings } = useGetLinkBookings(linkId || "", { query: { enabled: !!linkId && isOpen } });
  const { data: visits } = useGetLinkVisits(linkId || "", { query: { enabled: !!linkId && isOpen } });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Szczegóły linku</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Potwierdzone randki 🥳</h3>
            {bookings && bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Data i czas</TableHead>
                    <TableHead>Kiedy potwierdzono</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.dateType === "Inna" ? b.customDateType : b.dateType}</TableCell>
                      <TableCell>{b.date} {b.time}</TableCell>
                      <TableCell>{format(new Date(b.confirmedAt), "dd.MM.yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 italic">Jeszcze nikt się nie zgodził 🥺</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Historia wizyt 👀</h3>
            {visits && visits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Czas</TableHead>
                    <TableHead>Lokalizacja</TableHead>
                    <TableHead>Urządzenie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map(v => (
                    <TableRow key={v.id}>
                      <TableCell>{format(new Date(v.createdAt), "dd.MM.yyyy HH:mm")}</TableCell>
                      <TableCell>{[v.city, v.country].filter(Boolean).join(", ") || "Nieznana"}</TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-xs truncate">{v.userAgent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 italic">Brak wizyt na tym linku.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
