import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, usePagination } from 'react-table';
import './App.css';

function App() {
  // For testing purposes, we're setting a default account address
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Transaction Address',
        accessor: 'hash', // Assuming 'hash' is the transaction address
      },
      {
        Header: 'From',
        accessor: 'from',
      },
      {
        Header: 'To',
        accessor: 'to',
      },
      {
        Header: 'Time Stamp',
        accessor: 'timeStamp',
      },
    ],
    []
  );

  const data = React.useMemo(() => transactions, [transactions]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 8 }, // Set initial pageSize to 8
      manualPagination: true,
      pageCount: pageCount,
    },
    usePagination
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      if (account) {
        setLoading(true);
        const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
        const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`);
        setTransactions(response.data.result);
        setPageCount(Math.ceil(response.data.result.length / 8)); // Set to 8 transactions per page
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

  useEffect(() => {
  console.log('Before gotoPage call, pageIndex:', pageIndex);
  gotoPage(pageIndex);
  console.log('After gotoPage call, pageIndex:', pageIndex);
}, [pageIndex, gotoPage, transactions]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Wallet Transaction Explorer</h1>
        {account ? (
          <>
            <p>Connected Account: {account}</p>
            <div>
              {loading ? (
                <p>Loading...</p>
              ) : transactions.length > 0 ? (
                <>
                  <table {...getTableProps()}>
                    <thead>
                      {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {page.map((row, i) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                              return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button onClick={() => gotoPage(oldPageIndex => Math.max(oldPageIndex - 1, 0))} disabled={!canPreviousPage}>
                      {'<'}
                    </button>{' '}
                    <button onClick={() => gotoPage(oldPageIndex => Math.min(oldPageIndex + 1, pageOptions.length - 1))} disabled={!canNextPage}>
                      {'>'}
                    </button>
                    <span>
                      Page{' '}
                      <strong>
                        {pageIndex + 1} of {pageOptions.length}
                      </strong>{' '}
                    </span>
                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                      }}
                    >
                      {
                        [8].map(pageSize => (
                          <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </>
              ) : (
                <p>No transactions found for this account.</p>
              )}
            </div>
          </>
        ) : (
          <button onClick={connectWalletHandler}>Connect to MetaMask</button>
        )}
      </header>
    </div>
  );
}

export default App;
