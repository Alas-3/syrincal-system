import { useState } from 'react';
import supabase from '../../lib/supabaseClient';

const ClientForm = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [account, setAccount] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('clients').insert([
      {
        name,
        address,
        contact_number: contactNo,
        account,
        tin_number: tinNumber,
        contact_person: contactPerson,
      },
    ]);
    if (error) {
      console.error('Error adding client:', error);
    } else {
      setName('');
      setAddress('');
      setContactNo('');
      setAccount('');
      setTinNumber('');
      setContactPerson('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client Name"
        className="input"
        required
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="input"
      />
      <input
        type="text"
        value={contactNo}
        onChange={(e) => setContactNo(e.target.value)}
        placeholder="Contact No."
        className="input"
      />
      <input
        type="text"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        placeholder="Account"
        className="input"
      />
      <input
        type="text"
        value={tinNumber}
        onChange={(e) => setTinNumber(e.target.value)}
        placeholder="TIN Number"
        className="input"
      />
      <input
        type="text"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
        placeholder="Contact Person"
        className="input"
      />
      <button type="submit" className="btn">
        Save Client
      </button>
    </form>
  );
};

export default ClientForm;
