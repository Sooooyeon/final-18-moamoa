import React, { useEffect, useState } from 'react';
import { Container } from '../../Components/Common/Container';
import UserSearch from '../../Components/Common/HeaderSearch';
import { SearchAPI } from '../../API/Search/SearchAPI';
import styled from 'styled-components';
import Footer from '../../Components/Common/Footer';
import { useRecoilValue } from 'recoil';
import userTokenAtom from '../../Recoil/userTokenAtom';
import useDebounce from '../../Hooks/Search/useDebounce';

import SearchResultSkeleton from '../../Components/Search/SearchSkeleton';
import NotFound from '../../Components/Search/NotFound';
import SearchResultBox from '../../Components/Search/SearchResultBox';

import 'react-loading-skeleton/dist/skeleton.css';

export default function Search() {
  const [, setError] = useState(null);
  const token = useRecoilValue(userTokenAtom);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceValue = useDebounce(searchText);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    let cancel = false;
    async function fetchData(debounceValue) {
      setIsLoading(true);
      try {
        const result = await SearchAPI(token, debounceValue);
        if (!cancel) {
          setSearchResults(result);
          const skeletonTimer = 1000;
          setTimeout(() => {
            setIsLoading(false);
          }, skeletonTimer);
        }
      } catch (error) {
        if (!cancel) {
          setError(error);
          setIsLoading(false);
          console.error(error);
        }
      }
    }
    if (searchText) {
      const notFoundTimer = 3000;
      fetchData(debounceValue);
      setTimeout(() => {
        setIsLoading(false);
      }, notFoundTimer);
    }
    return () => {
      cancel = true;
      setSearchResults(null);
    };
  }, [debounceValue, searchText, token]);

  useEffect(() => {
    setSearchResults(null);
  }, [searchText]);

  return (
    <Container>
      <UserSearch setSearchText={setSearchText}></UserSearch>
      <SearchListWrap>
        {isLoading ? (
          <SearchResultSkeleton />
        ) : searchResults?.length ? (
          searchResults
            .slice(0, 5)
            .map((item, index) => (
              <SearchResultBox key={index} item={item} searchText={searchText} />
            ))
        ) : (
          <NotFound />
        )}
      </SearchListWrap>
      <Footer></Footer>
    </Container>
  );
}

const SearchListWrap = styled.div`
  margin-top: 48px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
