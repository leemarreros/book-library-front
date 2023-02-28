import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import libraryABI from '../abi/Library.json';
import Button from '../components/ui/Button';

const Library = () => {
  const { data: signer } = useSigner();
  const contractAddress = '0xE3d89649EA5f7Ad20DEef8912e0faD55EE884088';

  const initialFormAddBook = {
    bookName: '',
    numberOfCopies: 0,
    idToReturn: 0,
  };

  // Contract states
  const [contract, setContract] = useState();
  const [contractData, setContractData] = useState({});
  const [isLoadingContractData, setIsLoadingContractData] = useState(true);

  const [addBookFormData, setAddBookFormData] = useState(initialFormAddBook);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  // rent
  const [isLoadingRent, setIsLoadingRent] = useState(false);
  const [formRentError, setFormRentError] = useState('');

  // return
  const [isLoadingReturn, setIsLoadingReturn] = useState(false);
  const [formReturnError, setFormReturnError] = useState('');

  const getContractData = useCallback(async () => {
    setIsLoadingContractData(true);

    const availableBooks = await contract.getAvailableBooks();

    setContractData({ availableBooks });

    setIsLoadingContractData(false);
  }, [contract]);

  // Use effects
  useEffect(() => {
    if (signer) {
      const libraryContract = new ethers.Contract(contractAddress, libraryABI, signer);

      setContract(libraryContract);
    }
  }, [signer]);

  useEffect(() => {
    contract && getContractData();
  }, [contract, getContractData]);

  // Handlers
  const handleFormInputChange = e => {
    const { value, name } = e.target;
    console.log(value, name);
    setAddBookFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitButtonClick = async () => {
    setIsLoadingSubmit(true);
    // setAddBookFormData(initialFormAddBook);

    try {
      const { bookName, numberOfCopies } = addBookFormData;

      const tx = await contract.addBook(bookName, numberOfCopies);
      await tx.wait();

      setAddBookFormData(initialFormAddBook);

      await getContractData();
    } catch (e) {
      //   setFormSubmitError(e.reason);
      console.log(e.reason);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleRentBookButtonClick = async id => {
    setIsLoadingRent(true);
    setFormRentError('');

    try {
      const tx = await contract.borrowBookById(id);
      await tx.wait();

      await getContractData();
    } catch (e) {
      setFormRentError(e.reason);
      console.log(e.reason);
    } finally {
      setIsLoadingRent(false);
    }
  };

  const handleReturnBookButtonClick = async id => {
    // isLoadingReturn, setIsLoadingReturn;
    // formReturnError, setFormReturnError;
    setIsLoadingReturn(true);
    setFormReturnError('');

    try {
      const tx = await contract.returnBookById(id);
      await tx.wait();

      await getContractData();
    } catch (e) {
      setFormReturnError(e.reason);
    } finally {
      setIsLoadingReturn(false);
    }
  };

  return (
    <div className="container my-5 my-lg-10">
      <div className="row">
        <div className="col-6 offset-3">
          <h2 className="heading-medium text-center mb-5">Library</h2>
          {isLoadingContractData ? (
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-center ms-3">Loading...</p>
            </div>
          ) : (
            <>
              <div className="card mt-5">
                <div>
                  <p className="text-small text-bold">Add a Book:</p>
                  <input
                    type="text"
                    className="form-control"
                    name="bookName"
                    placeholder="Book Name"
                    value={addBookFormData.bookName}
                    onChange={handleFormInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="numberOfCopies"
                    placeholder="Number of Copies"
                    value={addBookFormData.numberOfCopies}
                    onChange={handleFormInputChange}
                  />
                </div>
                <div className="mt-4 d-flex justify-content-center">
                  <Button
                    onClick={handleSubmitButtonClick}
                    loading={isLoadingSubmit}
                    type="primary"
                  >
                    Submit
                  </Button>
                </div>
              </div>
              <br></br>
              <div>
                <p>Rent one of the available Books:</p>
                {contractData.availableBooks.map(availableBook => (
                  <div>
                    <span className="badge text-bg-info text-small">
                      Book Name: {availableBook[0]}
                    </span>
                    <span className="badge text-bg-info text-small">
                      Available copies: {availableBook[2].toString()}
                    </span>
                    <span className="badge text-bg-info text-small">
                      Book ID: {availableBook[3].toString()}
                    </span>
                    <Button
                      className="ms-2"
                      onClick={() => handleRentBookButtonClick(availableBook[3].toNumber())}
                      loading={isLoadingRent}
                      type="secondary"
                    >
                      Rent this book
                    </Button>
                    {formRentError ? (
                      <div className="alert alert-danger mb-4">{formRentError}</div>
                    ) : null}
                  </div>
                ))}
              </div>
              <br></br>
              <div>
                <p>Return a book by ID:</p>
                <input
                  type="text"
                  className="form-control"
                  name="idToReturn"
                  placeholder="Book ID to return"
                  value={addBookFormData.idToReturn}
                  onChange={handleFormInputChange}
                />
                <Button
                  className="ms-2"
                  onClick={() => handleReturnBookButtonClick(addBookFormData.idToReturn)}
                  loading={isLoadingReturn}
                  type="secondary"
                >
                  Return a book
                </Button>
                {formReturnError ? (
                  <div className="alert alert-danger mb-4">{formReturnError}</div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
