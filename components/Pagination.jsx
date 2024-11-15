const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const handlePageChange = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      onPageChange(pageNumber);
    };
  
    return (
      <div className="flex justify-center space-x-2">
        <button onClick={() => handlePageChange(currentPage - 1)} className="btn">
          &lt;
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} className="btn">
          &gt;
        </button>
      </div>
    );
  };
  
  export default Pagination;
  