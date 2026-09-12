'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Calculator,
  Clock,
  DollarSign,
  Package
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { clientAuthorizedFetch } from '@/lib/auth-fetch-client';
import { useToast } from '@/hooks/use-toast';

interface Sluzba {
  id: number;
  nazev: string;
  popis: string | null;
  kategorieId: number;
  dobaTrvaniMinuty: number;
  cenaTopStylist: number; // Skutečné pole z databáze - používáme jako hlavní cena
  cenaStylist: number;    // Skutečné pole z databáze
  cenaJuniorStylist: number; // Skutečné pole z databáze
  jeAktivni: boolean;
  poradi: number;
}

interface Kategorie {
  id: number;
  nazev: string;
  popis: string | null;
  poradi: number;
  jeAktivni: boolean;
  sluzby: Sluzba[];
}

export function CenikManager() {
  const { toast } = useToast();
  const [kategorie, setKategorie] = useState<Kategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKategorieDialog, setShowKategorieDialog] = useState(false);
  const [showSluzbaDialog, setShowSluzbaDialog] = useState(false);
  const [editingKategorie, setEditingKategorie] = useState<Kategorie | null>(null);
  const [editingSluzba, setEditingSluzba] = useState<Sluzba | null>(null);
  const [kategorieForm, setKategorieForm] = useState({
    nazev: '',
    popis: '',
    jeAktivni: true
  });
  const [sluzbaForm, setSluzbaForm] = useState({
    nazev: '',
    popis: '',
    kategorieId: 0,
    dobaTrvaniMinuty: 60,
    cenaOd: 0,
    cenaDo: 0,
    jeAktivni: true
  });
  const [draggedKategorie, setDraggedKategorie] = useState<number | null>(null);
  const [dragOverKategorie, setDragOverKategorie] = useState<number | null>(null);
  const [draggedSluzba, setDraggedSluzba] = useState<number | null>(null);
  const [dragOverSluzba, setDragOverSluzba] = useState<number | null>(null);
  const [draggedSluzbaFromKategorie, setDraggedSluzbaFromKategorie] = useState<number | null>(null);
  const [selectedSluzby, setSelectedSluzby] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadKategorie();
  }, []);

  const loadKategorie = async () => {
    setLoading(true);
    try {
      const response = await clientAuthorizedFetch('/api/admin/cenik/kategorie');
      if (response.ok) {
        const data = await response.json();
        setKategorie(data.kategorie || []);
      }
    } catch (error) {
      console.error('Chyba při načítání kategorií:', error);
    } finally {
      setLoading(false);
    }
  };

  const openKategorieDialog = (kategorie?: Kategorie) => {
    if (kategorie) {
      setEditingKategorie(kategorie);
      setKategorieForm({
        nazev: kategorie.nazev,
        popis: kategorie.popis || '',
        jeAktivni: kategorie.jeAktivni
      });
    } else {
      setEditingKategorie(null);
      setKategorieForm({
        nazev: '',
        popis: '',
        jeAktivni: true
      });
    }
    setShowKategorieDialog(true);
  };

  const openSluzbaDialog = (sluzba?: Sluzba, kategorieId?: number) => {
    if (sluzba) {
      setEditingSluzba(sluzba);
      setSluzbaForm({
        nazev: sluzba.nazev,
        popis: sluzba.popis || '',
        kategorieId: sluzba.kategorieId,
        dobaTrvaniMinuty: sluzba.dobaTrvaniMinuty,
        cenaOd: Math.min(sluzba.cenaJuniorStylist, sluzba.cenaStylist, sluzba.cenaTopStylist) || sluzba.cenaJuniorStylist,
        cenaDo: Math.max(sluzba.cenaJuniorStylist, sluzba.cenaStylist, sluzba.cenaTopStylist),
        jeAktivni: sluzba.jeAktivni
      });
    } else {
      setEditingSluzba(null);
      setSluzbaForm({
        nazev: '',
        popis: '',
        kategorieId: kategorieId || 0,
        dobaTrvaniMinuty: 60,
        cenaOd: 0,
        cenaDo: 0,
        jeAktivni: true
      });
    }
    setShowSluzbaDialog(true);
  };

  const saveKategorie = async () => {
    try {
      const url = editingKategorie 
        ? `/api/admin/cenik/kategorie/${editingKategorie.id}`
        : '/api/admin/cenik/kategorie';
      const method = editingKategorie ? 'PUT' : 'POST';
      
      const response = await clientAuthorizedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kategorieForm)
      });

      if (response.ok) {
        const currentScrollY = window.scrollY;
        setShowKategorieDialog(false);
        if (editingKategorie) {
          setKategorie(prev => prev.map(k => 
            k.id === editingKategorie.id ? { ...k, ...kategorieForm } : k
          ));
          requestAnimationFrame(() => window.scrollTo(0, currentScrollY));
          toast({
            title: "Uloženo",
            description: "Kategorie byla aktualizována",
            variant: "default"
          });
        } else {
          await loadKategorie();
          requestAnimationFrame(() => window.scrollTo(0, currentScrollY));
          toast({
            title: "Hotovo", 
            description: "Kategorie byla vytvořena",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Chyba",
          description: "Chyba při ukládání kategorie",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při ukládání kategorie:', error);
      toast({
        title: "Chyba",
        description: "Chyba při ukládání kategorie", 
        variant: "destructive"
      });
    }
  };

  const saveSluzba = async () => {
    try {
      const url = editingSluzba 
        ? `/api/admin/cenik/sluzby/${editingSluzba.id}`
        : '/api/admin/cenik/sluzby';
      const method = editingSluzba ? 'PUT' : 'POST';
      
      const response = await clientAuthorizedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nazev: sluzbaForm.nazev,
          popis: sluzbaForm.popis,
          kategorieId: sluzbaForm.kategorieId,
          dobaTrvaniMinuty: sluzbaForm.dobaTrvaniMinuty,
          cenaJuniorStylist: sluzbaForm.cenaOd,
          cenaStylist: sluzbaForm.cenaOd,
          cenaTopStylist: sluzbaForm.cenaDo,
          jeAktivni: sluzbaForm.jeAktivni
        })
      });

      if (response.ok) {
        const currentScrollY = window.scrollY;
        setShowSluzbaDialog(false);
        if (editingSluzba) {
          // Optimistic update - bez reloadu
          setKategorie(prev => prev.map(k => ({
            ...k,
            sluzby: k.sluzby.map(s =>
              s.id === editingSluzba.id
                ? {
                    ...s,
                    nazev: sluzbaForm.nazev,
                    popis: sluzbaForm.popis || null,
                    dobaTrvaniMinuty: sluzbaForm.dobaTrvaniMinuty,
                    cenaJuniorStylist: sluzbaForm.cenaOd,
                    cenaStylist: sluzbaForm.cenaOd,
                    cenaTopStylist: sluzbaForm.cenaDo,
                    jeAktivni: sluzbaForm.jeAktivni
                  }
                : s
            )
          })));
          requestAnimationFrame(() => window.scrollTo(0, currentScrollY));
        } else {
          // Nová služba - musíme refreshnout
          await loadKategorie();
          requestAnimationFrame(() => window.scrollTo(0, currentScrollY));
        }
        toast({
          title: "Uloženo",
          description: editingSluzba ? 'Služba byla aktualizována' : 'Služba byla vytvořena',
          variant: "default"
        });
      } else {
        toast({
          title: "Chyba",
          description: "Chyba při ukládání služby",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při ukládání služby:', error);
      toast({
        title: "Chyba",
        description: "Chyba při ukládání služby",
        variant: "destructive"
      });
    }
  };

  const deleteKategorie = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto kategorii? Budou smazány i všechny služby v této kategorii.')) {
      return;
    }

    try {
      const response = await clientAuthorizedFetch(`/api/admin/cenik/kategorie/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Optimistic update - odstránime kategoriu z state-u
        const currentScrollY = window.scrollY;
        setKategorie(prev => prev.filter(k => k.id !== id));
        setTimeout(() => window.scrollTo(0, currentScrollY), 10);
        toast({
          title: "Úspech",
          description: "Kategorie byla smazána",
          variant: "default"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Chyba",
          description: errorData.chyba || 'Chyba při mazání kategorie',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při mazání kategorie:', error);
      toast({
        title: "Chyba",
        description: "Chyba při mazání kategorie",
        variant: "destructive"
      });
    }
  };

  const toggleSelectSluzba = (id: number) => {
    setSelectedSluzby(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllInKategorie = (sluzbyIds: number[]) => {
    const allSelected = sluzbyIds.every(id => selectedSluzby.has(id));
    setSelectedSluzby(prev => {
      const next = new Set(prev);
      sluzbyIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const deleteSelectedSluzby = async () => {
    if (selectedSluzby.size === 0) return;
    if (!confirm(`Opravdu chcete smazat ${selectedSluzby.size} vybraných služeb?`)) return;

    const ids = Array.from(selectedSluzby);
    let chyby = 0;
    await Promise.all(ids.map(async (id) => {
      try {
        const response = await clientAuthorizedFetch(`/api/admin/cenik/sluzby/${id}`, { method: 'DELETE' });
        if (!response.ok) chyby++;
      } catch {
        chyby++;
      }
    }));

    setSelectedSluzby(new Set());
    await loadKategorie();
    toast({
      title: chyby === 0 ? 'Hotovo' : 'Částečná chyba',
      description: chyby === 0
        ? `${ids.length} služeb bylo smazáno`
        : `Smazáno ${ids.length - chyby} z ${ids.length}, ${chyby} se nepodařilo`,
      variant: chyby === 0 ? 'default' : 'destructive'
    });
  };

  const deleteSluzba = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto službu?')) {
      return;
    }

    try {
      const response = await clientAuthorizedFetch(`/api/admin/cenik/sluzby/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Optimistic update pre služby
        const currentScrollY = window.scrollY;
        await loadKategorie(); // Musíme refreshnúť kvôli reláciám
        setTimeout(() => window.scrollTo(0, currentScrollY), 10);
        toast({
          title: "Úspech",
          description: "Služba byla smazána",
          variant: "default"
        });
      } else {
        toast({
          title: "Chyba",
          description: "Chyba při mazání služby",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při mazání služby:', error);
      toast({
        title: "Chyba",
        description: "Chyba při mazání služby",
        variant: "destructive"
      });
    }
  };

  const toggleKategorieAktivni = async (id: number, jeAktivni: boolean) => {
    try {
      // Optimistic update
      setKategorie(prev => prev.map(k => 
        k.id === id ? { ...k, jeAktivni: !jeAktivni } : k
      ));

      const response = await clientAuthorizedFetch(`/api/admin/cenik/kategorie/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeAktivni: !jeAktivni })
      });

      if (!response.ok) {
        // Rollback pri chybe
        setKategorie(prev => prev.map(k => 
          k.id === id ? { ...k, jeAktivni: jeAktivni } : k
        ));
        toast({
          title: "Chyba",
          description: "Chyba při změně stavu kategorie",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při změně stavu kategorie:', error);
      // Rollback pri chybe
      setKategorie(prev => prev.map(k => 
        k.id === id ? { ...k, jeAktivni: jeAktivni } : k
      ));
      toast({
        title: "Chyba",
        description: "Chyba při změně stavu kategorie", 
        variant: "destructive"
      });
    }
  };

  const toggleSluzbaAktivni = async (id: number, jeAktivni: boolean) => {
    try {
      // Optimistic update
      setKategorie(prev => prev.map(k => ({
        ...k,
        sluzby: k.sluzby.map(s => 
          s.id === id ? { ...s, jeAktivni: !jeAktivni } : s
        )
      })));

      const response = await clientAuthorizedFetch(`/api/admin/cenik/sluzby/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeAktivni: !jeAktivni })
      });

      if (!response.ok) {
        // Rollback pri chybe
        setKategorie(prev => prev.map(k => ({
          ...k,
          sluzby: k.sluzby.map(s => 
            s.id === id ? { ...s, jeAktivni: jeAktivni } : s
          )
        })));
        toast({
          title: "Chyba",
          description: "Chyba při změně stavu služby",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Chyba při změně stavu služby:', error);
      // Rollback pri chybe
      setKategorie(prev => prev.map(k => ({
        ...k,
        sluzby: k.sluzby.map(s => 
          s.id === id ? { ...s, jeAktivni: jeAktivni } : s
        )
      })));
      toast({
        title: "Chyba",
        description: "Chyba při změně stavu služby",
        variant: "destructive"
      });
    }
  };

  // Drag & Drop functions
  const handleDragStart = (e: React.DragEvent, kategorieId: number) => {
    setDraggedKategorie(kategorieId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom ghost image
    const kategorieName = kategorie.find(k => k.id === kategorieId)?.nazev || 'Kategorie';
    const ghost = document.createElement('div');
    ghost.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(184, 168, 118, 0.95), rgba(163, 149, 102, 0.95));
        border: 2px solid #B8A876;
        border-radius: 12px;
        padding: 16px 20px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
      ">
        <span style="font-size: 16px;">📋</span>
        <span>Přesouvám: ${kategorieName}</span>
      </div>
    `;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 125, 25);
    
    // Clean up ghost element
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (kategorieId: number) => {
    if (draggedKategorie && draggedKategorie !== kategorieId) {
      setDragOverKategorie(kategorieId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the entire drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverKategorie(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetKategorieId: number) => {
    e.preventDefault();
    setDragOverKategorie(null);
    
    if (!draggedKategorie || draggedKategorie === targetKategorieId) {
      setDraggedKategorie(null);
      return;
    }

    const reorderedKategorie = [...kategorie];
    const originalOrder = [...kategorie]; // Uložíme pôvodnú hodnotu pred zmenou
    const draggedIndex = reorderedKategorie.findIndex(k => k.id === draggedKategorie);
    const targetIndex = reorderedKategorie.findIndex(k => k.id === targetKategorieId);

    // Remove dragged item and insert at target position
    const [draggedItem] = reorderedKategorie.splice(draggedIndex, 1);
    reorderedKategorie.splice(targetIndex, 0, draggedItem);

    // Update local state immediately (optimistic update)
    setKategorie(reorderedKategorie);

    // Send update to server
    try {
      const response = await clientAuthorizedFetch('/api/admin/cenik/kategorie/poradi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategorie: reorderedKategorie })
      });

      if (!response.ok) {
        // Revert on error - obnovíme pôvodné dáta bez scroll jump
        setKategorie(originalOrder);
        toast({
          title: "Chyba",
          description: "Chyba při změně pořadí kategorií",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Revert on error - obnovíme pôvodné dáta bez scroll jump 
      setKategorie(originalOrder);
      toast({
        title: "Chyba", 
        description: "Chyba při změně pořadí kategorií",
        variant: "destructive"
      });
      console.error('Chyba při aktualizaci pořadí:', error);
    }

    setDraggedKategorie(null);
  };

  const handleDragEnd = () => {
    setDraggedKategorie(null);
    setDragOverKategorie(null);
  };

  // Drag & Drop functions for services
  const handleSluzbaDropStart = (e: React.DragEvent, sluzbaId: number, kategorieId: number) => {
    setDraggedSluzba(sluzbaId);
    setDraggedSluzbaFromKategorie(kategorieId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom ghost image
    const sluzbaName = kategorie
      .find(k => k.id === kategorieId)?.sluzby
      .find(s => s.id === sluzbaId)?.nazev || 'Služba';
    const ghost = document.createElement('div');
    ghost.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(184, 168, 118, 0.95), rgba(163, 149, 102, 0.95));
        border: 2px solid #B8A876;
        border-radius: 8px;
        padding: 12px 16px;
        color: white;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 300px;
      ">
        <span style="font-size: 14px;">✂️</span>
        <span>Přesouvám: ${sluzbaName}</span>
      </div>
    `;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 150, 25);
    
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  const handleSluzbaDropOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSluzbaDropEnter = (sluzbaId: number) => {
    if (draggedSluzba && draggedSluzba !== sluzbaId) {
      setDragOverSluzba(sluzbaId);
    }
  };

  const handleSluzbaDropLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSluzba(null);
    }
  };

  const handleSluzbaDropped = async (e: React.DragEvent, targetSluzbaId: number, kategorieId: number) => {
    e.preventDefault();
    setDragOverSluzba(null);
    
    if (!draggedSluzba || draggedSluzba === targetSluzbaId) {
      setDraggedSluzba(null);
      setDraggedSluzbaFromKategorie(null);
      return;
    }

    // If service is dragged from different category, we don't support this yet
    if (draggedSluzbaFromKategorie !== kategorieId) {
      setDraggedSluzba(null);
      setDraggedSluzbaFromKategorie(null);
      toast({
        title: "Upozornění",
        description: "Služby lze přetahovat pouze v rámci stejné kategorie",
        variant: "destructive"
      });
      return;
    }

    // Get current category sluzby and reorder them
    const targetKategorie = kategorie.find(k => k.id === kategorieId);
    if (!targetKategorie) return;

    const reorderedSluzby = [...targetKategorie.sluzby];
    const draggedIndex = reorderedSluzby.findIndex(s => s.id === draggedSluzba);
    const targetIndex = reorderedSluzby.findIndex(s => s.id === targetSluzbaId);

    // Remove dragged item and insert at target position
    const [draggedItem] = reorderedSluzby.splice(draggedIndex, 1);
    reorderedSluzby.splice(targetIndex, 0, draggedItem);

    // Update local state immediately (optimistic update)
    setKategorie(prev => prev.map(k => 
      k.id === kategorieId ? { ...k, sluzby: reorderedSluzby } : k
    ));

    // Send update to server
    try {
      const response = await clientAuthorizedFetch('/api/admin/cenik/sluzby/poradi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sluzby: reorderedSluzby.map(s => ({ id: s.id })),
          kategorieId 
        })
      });

      if (!response.ok) {
        // Revert on error
        await loadKategorie();
        toast({
          title: "Chyba",
          description: "Chyba při změně pořadí služeb",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Revert on error
      await loadKategorie();
      toast({
        title: "Chyba", 
        description: "Chyba při změně pořadí služeb",
        variant: "destructive"
      });
      console.error('Chyba při aktualizaci pořadí:', error);
    }

    setDraggedSluzba(null);
    setDraggedSluzbaFromKategorie(null);
  };

  const handleSluzbaDropEnd = () => {
    setDraggedSluzba(null);
    setDraggedSluzbaFromKategorie(null);
    setDragOverSluzba(null);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('cs-CZ')},- Kč`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8A876] mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Načítání ceníku...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Správa ceníku</h2>
          <p className="text-muted-foreground">Spravujte kategorie služeb a jednotlivé služby</p>
        </div>
        <Button onClick={() => openKategorieDialog()} className="bg-[#B8A876] hover:bg-[#A39566]">
          <Plus className="h-4 w-4 mr-2" />
          Nová kategorie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-transparent">
          <CardHeader className="pb-1 px-0">
            <CardTitle className="text-xs font-medium flex items-center">
              <Package className="h-3 w-3 mr-1 text-primary" />
              Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">{kategorie.length}</div>
            <p className="text-xs text-muted-foreground">
              {kategorie.filter(k => k.jeAktivni).length} aktivních
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 bg-transparent">
          <CardHeader className="pb-1 px-0">
            <CardTitle className="text-xs font-medium flex items-center">
              <Calculator className="h-3 w-3 mr-1 text-primary" />
              Služby
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {kategorie.reduce((sum, k) => sum + k.sluzby.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {kategorie.reduce((sum, k) => sum + k.sluzby.filter(s => s.jeAktivni).length, 0)} aktivních
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 bg-transparent">
          <CardHeader className="pb-1 px-0">
            <CardTitle className="text-xs font-medium flex items-center">
              <DollarSign className="h-3 w-3 mr-1 text-primary" />
              Cenový rozsah
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {(() => {
              const vsetkySluzby = kategorie.flatMap(k => k.sluzby.filter(s => s.jeAktivni));
              const vsetkyCeny = vsetkySluzby.flatMap(s => [s.cenaJuniorStylist, s.cenaStylist, s.cenaTopStylist]).filter(c => c > 0);
              
              if (vsetkyCeny.length === 0) {
                return <div className="text-sm font-bold">N/A</div>;
              }
              
              const min = Math.min(...vsetkyCeny);
              const max = Math.max(...vsetkyCeny);
              
              return (
                <div className="text-sm font-bold">
                  {min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`}
                </div>
              );
            })()}
            <p className="text-xs text-muted-foreground">Ze všech cenových úrovní</p>
          </CardContent>
        </Card>

        <Card className="p-3 bg-transparent">
          <CardHeader className="pb-1 px-0">
            <CardTitle className="text-xs font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1 text-primary" />
              Průměrná doba
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {(() => {
              const doby = kategorie.flatMap(k => k.sluzby.filter(s => s.jeAktivni).map(s => s.dobaTrvaniMinuty));
              const average = doby.length > 0 ? Math.round(doby.reduce((a, b) => a + b, 0) / doby.length) : 0;
              return (
                <div className="text-sm font-bold">
                  {formatDuration(average)}
                </div>
              );
            })()}
            <p className="text-xs text-muted-foreground">služeb</p>
          </CardContent>
        </Card>
      </div>

      {/* Kategorie a služby */}
      <div className="space-y-3">
        {kategorie.map((kategorie, index, kategorieArr) => (
          <div
            key={kategorie.id}
            className={`relative ${dragOverKategorie === kategorie.id ? 'scale-[1.02]' : ''} transition-all duration-200`}
          >
            {/* Drop zone indicator above */}
            {draggedKategorie && draggedKategorie !== kategorie.id && (
              <div 
                className={`absolute -top-1 left-0 right-0 h-0.5 bg-[#B8A876] rounded-full transition-all duration-200 ${
                  dragOverKategorie === kategorie.id ? 'opacity-100 scale-y-150' : 'opacity-0'
                }`}
              />
            )}
            
            <Card 
              className={`bg-transparent overflow-hidden transition-all duration-300 ease-out transform ${
                draggedKategorie === kategorie.id 
                  ? 'opacity-50 scale-[0.98] shadow-lg rotate-1 cursor-grabbing' 
                  : dragOverKategorie === kategorie.id 
                    ? 'shadow-lg border-[#B8A876] scale-[1.01]' 
                    : 'hover:shadow-md'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(kategorie.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, kategorie.id)}
            >
              <CardHeader className="bg-gradient-to-r from-[#B8A876]/10 to-[#A39566]/10 border-b py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {/* Dedicated drag handle */}
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#B8A876]/20 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 select-none"
                        draggable
                        onDragStart={(e) => handleDragStart(e, kategorie.id)}
                        onDragEnd={handleDragEnd}
                        title="Přetáhněte pro změnu pořadí"
                        role="button"
                        tabIndex={0}
                      >
                        <span className="text-primary text-lg font-bold">⋮⋮</span>
                      </div>
                      <CardTitle className="text-lg">{kategorie.nazev}</CardTitle>
                    <Badge variant={kategorie.jeAktivni ? 'default' : 'secondary'}>
                      {kategorie.jeAktivni ? 'Aktivní' : 'Neaktivní'}
                    </Badge>
                    <Switch
                      checked={kategorie.jeAktivni}
                      onCheckedChange={() => toggleKategorieAktivni(kategorie.id, kategorie.jeAktivni)}
                    />
                  </div>
                  {kategorie.popis && (
                    <p className="text-muted-foreground mt-1">{kategorie.popis}</p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {(() => {
                    const idsVKategorii = kategorie.sluzby.map(s => s.id);
                    const countSelected = idsVKategorii.filter(id => selectedSluzby.has(id)).length;
                    return countSelected > 0 ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteSelectedSluzby}
                        className="h-8 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Smazat vybrané ({countSelected})
                      </Button>
                    ) : null;
                  })()}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openSluzbaDialog(undefined, kategorie.id)}
                    title="Přidat službu"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openKategorieDialog(kategorie)}
                    title="Upravit kategorii"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteKategorie(kategorie.id)}
                    title="Smazat kategorii"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {kategorie.sluzby.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="w-[200px] py-2">Služba</TableHead>
                      <TableHead className="w-[80px] py-2">Doba</TableHead>
                      <TableHead className="w-[100px] py-2">Cena</TableHead>
                      <TableHead className="w-[60px] py-2">Stav</TableHead>
                      <TableHead className="w-[100px] py-2">
                        <div className="flex items-center gap-1">
                          <span>Akce</span>
                          <Checkbox
                            checked={kategorie.sluzby.length > 0 && kategorie.sluzby.every(s => selectedSluzby.has(s.id))}
                            onCheckedChange={() => toggleSelectAllInKategorie(kategorie.sluzby.map(s => s.id))}
                            aria-label="Vybrat vše"
                            className="border-gray-300 data-[state=checked]:bg-[#B8A876] data-[state=checked]:text-white data-[state=checked]:border-[#B8A876] ml-1"
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kategorie.sluzby.map((sluzba) => (
                      <TableRow 
                        key={sluzba.id} 
                        className={`h-12 transition-all duration-200 ${!sluzba.jeAktivni ? 'opacity-50' : ''} ${selectedSluzby.has(sluzba.id) ? 'bg-red-50 dark:bg-red-950/20' : ''} ${
                          draggedSluzba === sluzba.id 
                            ? 'opacity-50 scale-[0.99] bg-[#B8A876]/10 cursor-grabbing' 
                            : dragOverSluzba === sluzba.id 
                              ? 'bg-[#B8A876]/5' 
                              : 'hover:bg-[#B8A876]/10 dark:hover:bg-[#B8A876]/5'
                        }`}
                        draggable
                        onDragStart={(e) => handleSluzbaDropStart(e, sluzba.id, kategorie.id)}
                        onDragOver={handleSluzbaDropOver}
                        onDragEnter={() => handleSluzbaDropEnter(sluzba.id)}
                        onDragLeave={handleSluzbaDropLeave}
                        onDrop={(e) => handleSluzbaDropped(e, sluzba.id, kategorie.id)}
                        onDragEnd={handleSluzbaDropEnd}
                      >
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center w-5 h-5 text-xs cursor-grab hover:text-[#B8A876] active:cursor-grabbing select-none"
                              title="Přetáhněte pro změnu pořadí"
                            >
                              ⋮⋮
                            </div>
                            <div>
                              <div className="font-medium text-sm">{sluzba.nazev}</div>
                              {sluzba.popis && (
                                <div className="text-xs text-muted-foreground truncate max-w-[180px]">{sluzba.popis}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-sm">{formatDuration(sluzba.dobaTrvaniMinuty)}</TableCell>
                        <TableCell className="py-2 font-semibold text-sm">
                          {(() => {
                            const ceny = [sluzba.cenaJuniorStylist, sluzba.cenaStylist, sluzba.cenaTopStylist].filter(c => c > 0).sort((a, b) => a - b);
                            if (ceny.length === 0) return 'Cena neuvedena';
                            if (ceny.length === 1 || ceny[0] === ceny[ceny.length - 1]) return formatCurrency(ceny[0]);
                            return `${ceny[0].toLocaleString('cs-CZ')} - ${ceny[ceny.length - 1].toLocaleString('cs-CZ')},- Kč`;
                          })()}
                        </TableCell>
                        <TableCell className="py-2">
                          <Switch
                            checked={sluzba.jeAktivni}
                            onCheckedChange={() => toggleSluzbaAktivni(sluzba.id, sluzba.jeAktivni)}
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSluzbaDialog(sluzba)}
                              title="Upravit službu"
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSluzba(sluzba.id)}
                              title="Smazat službu"
                              className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Checkbox
                              checked={selectedSluzby.has(sluzba.id)}
                              onCheckedChange={() => toggleSelectSluzba(sluzba.id)}
                              aria-label={`Vybrat ${sluzba.nazev}`}
                              className="border-white data-[state=checked]:bg-[#B8A876] data-[state=checked]:text-white data-[state=checked]:border-[#B8A876] ml-0.5"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">V této kategorii nejsou žádné služby</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => openSluzbaDialog(undefined, kategorie.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Přidat první službu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Drop zone indicator below last item */}
          {draggedKategorie && index === kategorieArr.length - 1 && (
            <div 
              className={`mt-2 h-0.5 bg-[#B8A876] rounded-full transition-all duration-200 opacity-30`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKategorie(-1); // Special value for end position
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedKategorie) {
                  handleDrop(e, kategorie.id);
                }
              }}
            />
          )}
        </div>
        ))}
      </div>

      {kategorie.length === 0 && (
        <Card className="bg-transparent">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Žádné kategorie</h3>
            <p className="text-muted-foreground mb-6">
              Začněte vytvořením první kategorie služeb
            </p>
            <Button onClick={() => openKategorieDialog()} className="bg-[#B8A876] hover:bg-[#A39566]">
              <Plus className="h-4 w-4 mr-2" />
              Vytvořit kategorii
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog pro kategorii */}
      <Dialog open={showKategorieDialog} onOpenChange={setShowKategorieDialog}>
        <DialogContent className="sm:max-w-md bg-transparent">
          <DialogHeader>
            <DialogTitle>
              {editingKategorie ? 'Upravit kategorii' : 'Nová kategorie'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="kategorie-nazev">Název kategorie *</Label>
              <Input
                id="kategorie-nazev"
                value={kategorieForm.nazev}
                onChange={(e) => setKategorieForm(prev => ({ ...prev, nazev: e.target.value }))}
                placeholder="např. Dámské služby"
              />
            </div>

            <div>
              <Label htmlFor="kategorie-popis">Popis (volitelné)</Label>
              <Textarea
                id="kategorie-popis"
                value={kategorieForm.popis}
                onChange={(e) => setKategorieForm(prev => ({ ...prev, popis: e.target.value }))}
                placeholder="Krátký popis kategorie"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="kategorie-aktivni"
                checked={kategorieForm.jeAktivni}
                onCheckedChange={(checked) => setKategorieForm(prev => ({ ...prev, jeAktivni: checked }))}
              />
              <Label htmlFor="kategorie-aktivni">Aktivní kategorie</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKategorieDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={saveKategorie} disabled={!kategorieForm.nazev.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {editingKategorie ? 'Uložit' : 'Vytvořit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pro službu */}
      <Dialog open={showSluzbaDialog} onOpenChange={setShowSluzbaDialog}>
        <DialogContent className="sm:max-w-lg bg-transparent">
          <DialogHeader>
            <DialogTitle>
              {editingSluzba ? 'Upravit službu' : 'Nová služba'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label htmlFor="sluzba-nazev">Název služby *</Label>
              <Input
                id="sluzba-nazev"
                value={sluzbaForm.nazev}
                onChange={(e) => setSluzbaForm(prev => ({ ...prev, nazev: e.target.value }))}
                placeholder="např. Dámský střih"
              />
            </div>

            <div>
              <Label htmlFor="sluzba-popis">Popis (volitelné)</Label>
              <Textarea
                id="sluzba-popis"
                value={sluzbaForm.popis}
                onChange={(e) => setSluzbaForm(prev => ({ ...prev, popis: e.target.value }))}
                placeholder="Detailní popis služby"
              />
            </div>

            <div>
              <Label htmlFor="sluzba-kategorie">Kategorie *</Label>
              <select
                id="sluzba-kategorie"
                value={sluzbaForm.kategorieId}
                onChange={(e) => setSluzbaForm(prev => ({ ...prev, kategorieId: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
                aria-label="Vyberte kategorii služby"
              >
                <option value={0}>Vyberte kategorii</option>
                {kategorie.map(k => (
                  <option key={k.id} value={k.id}>{k.nazev}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sluzba-doba">Doba trvání (minuty) *</Label>
              <Input
                id="sluzba-doba"
                type="number"
                min="1"
                value={sluzbaForm.dobaTrvaniMinuty}
                onChange={(e) => setSluzbaForm(prev => ({ ...prev, dobaTrvaniMinuty: parseInt(e.target.value) || 60 }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Cena (Kč) *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sluzba-cena-od" className="text-xs text-muted-foreground">Od</Label>
                  <Input
                    id="sluzba-cena-od"
                    type="number"
                    min="0"
                    placeholder="Cena od"
                    value={sluzbaForm.cenaOd}
                    onChange={(e) => setSluzbaForm(prev => ({ ...prev, cenaOd: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sluzba-cena-do" className="text-xs text-muted-foreground">Do</Label>
                  <Input
                    id="sluzba-cena-do"
                    type="number"
                    min="0"
                    placeholder="Cena do (volitelné)"
                    value={sluzbaForm.cenaDo}
                    onChange={(e) => setSluzbaForm(prev => ({ ...prev, cenaDo: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sluzba-aktivni"
                checked={sluzbaForm.jeAktivni}
                onCheckedChange={(checked) => setSluzbaForm(prev => ({ ...prev, jeAktivni: checked }))}
              />
              <Label htmlFor="sluzba-aktivni">Aktivní služba</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSluzbaDialog(false)}>
              Zrušit
            </Button>
            <Button 
              onClick={saveSluzba} 
              disabled={
                !sluzbaForm.nazev.trim() || 
                !sluzbaForm.kategorieId || 
                sluzbaForm.cenaOd === 0
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {editingSluzba ? 'Uložit' : 'Vytvořit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}