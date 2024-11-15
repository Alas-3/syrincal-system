const ClientTable = ({ clients }) => {
    return (
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Address</th>
            <th>Contact No.</th>
            <th>Account</th>
            <th>TIN No.</th>
            <th>Contact Person</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.address}</td>
              <td>{client.contact_number}</td>
              <td>{client.account}</td>
              <td>{client.tin_number || '-'}</td>
              <td>{client.contact_person || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default ClientTable;
  