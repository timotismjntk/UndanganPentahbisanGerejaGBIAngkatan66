import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, MessageCircle, Users, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDb } from '@/lib/firebase';

interface Message {
  id: string;
  name: string;
  message: string;
  attendance: string;
  timestamp: number;
}

const RSVPForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState('yes');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: () => void;

    const setupFirestore = async () => {
      try {
        const { collection, onSnapshot, orderBy, query } = await import('firebase/firestore');
        const db = await getDb();
        const q = query(collection(db, 'rsvp-messages'), orderBy('timestamp', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages: Message[] = [];
          snapshot.forEach((doc) => {
            fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
          });
          setMessages(fetchedMessages);
        });
      } catch (error) {
        console.error('Failed to setup Firestore:', error);
      }
    };

    setupFirestore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Mohon lengkapi formulir",
        description: "Nama dan ucapan harus diisi.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const db = await getDb();
      
      await addDoc(collection(db, 'rsvp-messages'), {
        name: name.trim(),
        message: message.trim(),
        attendance,
        timestamp: Date.now(),
      });

      toast({
        title: "Terima kasih!",
        description: "Ucapan Anda telah terkirim.",
      });

      setName('');
      setMessage('');
      setAttendance('yes');
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Gagal mengirim",
        description: "Terjadi kesalahan, silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const attendingCount = messages.filter(m => m.attendance === 'yes').length;
  const notAttendingCount = messages.filter(m => m.attendance === 'no').length;

  return (
    <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Ucapan & Konfirmasi Kehadiran
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Berikan ucapan dan konfirmasikan kehadiran Anda
        </p>

        <Card className="p-8 mb-12 shadow-festive border-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-lg">Ucapan</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan Anda di sini..."
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            <div>
              <Label className="text-lg mb-4 block">Konfirmasi Kehadiran</Label>
              <RadioGroup value={attendance} onValueChange={setAttendance}>
                <div className="flex items-center space-x-3 mb-3">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer text-base">
                    Ya, saya akan hadir
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer text-base">
                    Maaf, saya tidak bisa hadir
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={loading}>
              <Heart className="w-5 h-5 mr-2" />
              {loading ? 'Mengirim...' : 'Kirim Ucapan'}
            </Button>
          </form>
        </Card>

        {messages.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center border-2 shadow-card">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{messages.length}</p>
                <p className="text-sm text-muted-foreground">Total Ucapan</p>
              </Card>
              <Card className="p-4 text-center border-2 shadow-card bg-primary/5">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{attendingCount}</p>
                <p className="text-sm text-muted-foreground">Hadir</p>
              </Card>
              <Card className="p-4 text-center border-2 shadow-card">
                <UserX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-3xl font-bold">{notAttendingCount}</p>
                <p className="text-sm text-muted-foreground">Tidak Hadir</p>
              </Card>
            </div>
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Ucapan dari Tamu
            </h3>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <Card key={msg.id} className="p-6 shadow-card hover:shadow-festive transition-smooth">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg">{msg.name}</h4>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      msg.attendance === 'yes' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {msg.attendance === 'yes' ? 'Hadir' : 'Tidak Hadir'}
                    </span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(msg.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RSVPForm;
