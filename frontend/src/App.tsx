import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Sites from './pages/Sites'
import Workers from './pages/Workers'
import Attendance from './pages/Attendance'
import WorkerDashboard from './pages/WorkerDashboard'
import Materials from './pages/Materials'
import Equipment from './pages/Equipment'
import Finance from './pages/Finance'
import Documents from './pages/Documents'
import Analytics from './pages/Analytics'
import InvoiceGenerator from './pages/InvoiceGenerator'
import { useAuth } from './store/useAuth'

import { useProjects } from './store/useProjects'
import { useWorkers } from './store/useWorkers'
import { useInvoices } from './store/useInvoices'
import { useFinance } from './store/useFinance'
import { useClients } from './store/useClients'
import { useSites } from './store/useSites'
import { useMaterials } from './store/useMaterials'
import { useEquipment } from './store/useEquipment'
import { useDocuments } from './store/useDocuments'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'Super Admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

function App() {
  const fetchProjects = useProjects(state => state.fetchProjects);
  const fetchWorkers = useWorkers(state => state.fetchWorkers);
  const fetchInvoices = useInvoices(state => state.fetchInvoices);
  const fetchTransactions = useFinance(state => state.fetchTransactions);
  const fetchClients = useClients(state => state.fetchClients);
  const fetchSites = useSites(state => state.fetchSites);
  const fetchMaterials = useMaterials(state => state.fetchMaterials);
  const fetchEquipment = useEquipment(state => state.fetchEquipment);
  const fetchDocuments = useDocuments(state => state.fetchDocuments);

  useEffect(() => {
    const loadData = () => {
      fetchProjects();
      fetchWorkers();
      fetchInvoices();
      fetchTransactions();
      fetchClients();
      fetchSites();
      fetchMaterials();
      fetchEquipment();
      fetchDocuments();
    };

    // Initial load
    loadData();

    // Auto-refresh every 10 seconds to keep everything synced across devices
    const intervalId = setInterval(loadData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchProjects, fetchWorkers, fetchInvoices, fetchTransactions, fetchClients, fetchSites, fetchMaterials, fetchEquipment, fetchDocuments]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes inside Dashboard Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Phase 2 Routes */}
          <Route path="clients" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Clients />
            </ProtectedRoute>
          } />
          
          <Route path="projects" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Projects />
            </ProtectedRoute>
          } />
          
          <Route path="sites" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager']}>
              <Sites />
            </ProtectedRoute>
          } />

          {/* Phase 3 Routes */}
          <Route path="workers" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager']}>
              <Workers />
            </ProtectedRoute>
          } />
          
          <Route path="attendance" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager']}>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="worker-portal" element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          } />

          {/* Phase 4 Routes */}
          <Route path="materials" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager', 'Accountant']}>
              <Materials />
            </ProtectedRoute>
          } />
          
          <Route path="equipment" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager']}>
              <Equipment />
            </ProtectedRoute>
          } />

          {/* Phase 5 Routes */}
          <Route path="finance" element={
            <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
              <Finance />
            </ProtectedRoute>
          } />

          {/* Phase 6 Routes */}
          <Route path="documents" element={
            <ProtectedRoute allowedRoles={['Admin', 'Site Manager', 'Client', 'Accountant']}>
              <Documents />
            </ProtectedRoute>
          } />

          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="invoice-generator" element={
            <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
              <InvoiceGenerator />
            </ProtectedRoute>
          } />
          
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
