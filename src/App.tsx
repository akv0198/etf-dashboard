import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Etfs from './pages/Etfs';
import EtfDetail from './pages/EtfDetail';
import Holdings from './pages/Holdings';
import Compare from './pages/Compare';
import Markets from './pages/Markets';
import Analysis from './pages/Analysis';
export default function App(){ return <Routes><Route element={<Layout/>}><Route path="/" element={<Overview/>}/><Route path="/etfs" element={<Etfs/>}/><Route path="/etfs/:id" element={<EtfDetail/>}/><Route path="/holdings" element={<Holdings/>}/><Route path="/compare" element={<Compare/>}/><Route path="/markets" element={<Markets/>}/><Route path="/analysis" element={<Analysis/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>; }
