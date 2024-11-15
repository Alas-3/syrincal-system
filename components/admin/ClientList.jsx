import { useState, useEffect } from 'react';
import ClientTable from './ClientTable';
import ClientForm from './ClientForm';
import Pagination from '../Pagination'; // Import the Pagination component
import supabase from '../../lib/supabaseClient';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(10);

  useEffect(() => {
    const getClients = async () => {
      const { data, error, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage - 1);
      if (error) console.error('Error fetching clients:', error);
      setClients(data);
      setTotalItems(count);
    };
    getClients();
  }, [currentPage]);

  const [totalItems, setTotalItems] = useState(0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Client List</h1>
      <ClientForm />
      <ClientTable clients={clients} />
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={clientsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ClientList;
