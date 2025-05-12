"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { MenuItem } from '../../lib/firestoreModels'

export default function MenuAdmin() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<any>({ name: '', price: '', description: '', type: 'classic', source: 'broskis' })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    setLoading(true)
    setError(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/admin/menu', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMenu(data.menu || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    setSaving(true)
    setError(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMenu((m) => [...m, data])
      setShowAdd(false)
      setNewItem({ name: '', price: '', description: '', type: 'classic', source: 'broskis' })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(item: MenuItem) {
    setEditingId(item.id ?? null)
    setEditItem({ ...item })
  }

  async function handleEditSave() {
    if (!editItem) return
    setSaving(true)
    setError(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch(`/api/admin/menu/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editItem,
          price: parseFloat(editItem.price),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMenu((m) => m.map((item) => (item.id === editingId ? { ...item, ...editItem } : item)))
      setEditingId(null)
      setEditItem(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return
    setDeletingId(id)
    setError(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMenu((m) => m.filter((item) => item.id !== id))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Menu Management</h3>
        <Button onClick={() => setShowAdd((v) => !v)}>{showAdd ? 'Cancel' : 'Add New Item'}</Button>
      </div>
      {showAdd && (
        <Card className="p-4 mb-4">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <Input placeholder="Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
            <Input placeholder="Price" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
            <Input placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
            <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="border rounded px-2 py-1">
              <option value="classic">Classic</option>
              <option value="infused">Infused</option>
            </select>
            <select value={newItem.source} onChange={e => setNewItem({ ...newItem, source: e.target.value })} className="border rounded px-2 py-1">
              <option value="broskis">Broskis</option>
              <option value="partner">Partner</option>
            </select>
            <Button onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </Card>
      )}
      {loading ? (
        <div className="text-center py-8">Loading menu...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.map((item, i) => (
            <Card key={item.id || i} className="p-4 flex flex-col gap-2">
              {editingId === item.id ? (
                <div className="flex flex-col gap-2">
                  <Input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
                  <Input value={editItem.price} type="number" onChange={e => setEditItem({ ...editItem, price: e.target.value })} />
                  <Input value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} />
                  <select value={editItem.type} onChange={e => setEditItem({ ...editItem, type: e.target.value })} className="border rounded px-2 py-1">
                    <option value="classic">Classic</option>
                    <option value="infused">Infused</option>
                  </select>
                  <select value={editItem.source} onChange={e => setEditItem({ ...editItem, source: e.target.value })} className="border rounded px-2 py-1">
                    <option value="broskis">Broskis</option>
                    <option value="partner">Partner</option>
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button variant="ghost" onClick={() => { setEditingId(null); setEditItem(null) }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.type} | {item.source}</div>
                    </div>
                    <div className="font-bold text-otw-gold-600">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">{item.description}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id!)} disabled={deletingId === item.id}>{deletingId === item.id ? 'Deleting...' : 'Delete'}</Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
