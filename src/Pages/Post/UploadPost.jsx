/*
  설명: 게시글 등록 페이지
  작성자: 이해지
  최초 작성 날짜: 2023.10.24
  마지막 수정 날까: 2024.02.05

  추가 작성자: 유의진 
  추가 내용: 이미지 크롭 기능
  작성 날짜: 2023.12.26
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Container } from '../../Components/Common/Container';
import Gobackbtn from '../../Components/Common/GoBackbtn';
import ButtonSubmit from '../../Components/Common/Button';

import uploadFile from '../../Assets/images/upload-file.png';
import xButton from '../../Assets/icons/x.svg';

import { uploadPost } from '../../API/Post/PostAPI';

import { getMyProfileData } from '../../API/Profile/ProfileAPI';
import { useImage } from '../../Hooks/Common/useImage';
import ImageCropModal from '../../Components/Modal/ImageCropModal';
import NavBar from '../../Components/Common/NavBar';

import {
  HeaderContainer,
  UploadPostBox,
  ProfileImg,
  TextArea,
  ImgPre,
  XButton,
  InputImgIcon,
} from './UploadEditPostStyle';

export default function AddPost() {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [userImage, setUserImage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const { imgData, setImgData, showImgModal, onSelectFile, onCancel, setCroppedImageFor } =
    useImage(null);

  const [isTabletScreen, setIsTabletScreen] = useState(window.innerWidth >= 768);

  const getUserImg = async () => {
    try {
      const response = await await getMyProfileData();

      if (response && response.user) {
        setUserImage(response.user['image'] || '');
      }
    } catch (error) {
      console.log('유저 프로필 이미지를 찾을 수 없습니다.');
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 getInitInfo 함수를 실행
    getUserImg();

    const handleResize = () => {
      setIsTabletScreen(window.innerWidth >= 768);
    };

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const inputContent = (e) => {
    setContent(e.target.value);
  };

  //textarea 높이 설정
  const adjustTextareaHeight = (event) => {
    const textarea = event.target;
    // 높이 초기화
    textarea.style.height = 'auto';
    // 스크롤 높이만큼 textarea 높이 설정
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const submitPost = async (e) => {
    e.preventDefault();
    const uploadPostData = {
      post: {
        content,
        image: imgData.croppedImageUrl ? imgData.croppedImageUrl || imgData.imageUrl : '',
      },
    };

    await uploadPost(uploadPostData);
    navigate('/profile/myInfo');
  };

  const closeImg = () => {
    setImgData({
      imageUrl: '',
      croppedImageUrl: null,
    });
    document.getElementById('profileImg').value = ''; // 파일 인풋 초기화
  };

  useEffect(() => {
    if (content.trim() === '' && (!imgData.croppedImageUrl || !imgData.imageUrl)) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [content, imgData]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submitPost(e);
  };

  return (
    <Container>
      {!isTabletScreen && (
        <HeaderContainer>
          <Gobackbtn />
          <ButtonSubmit
            buttonText='업로드'
            onClickHandler={submitPost}
            disabled={isButtonDisabled}
          />
        </HeaderContainer>
      )}
      {showImgModal && (
        <ImageCropModal
          imageUrl={imgData.imageUrl}
          cropInit={imgData.crop}
          zoomInit={imgData.zoom}
          onCancel={onCancel}
          setCroppedImageFor={setCroppedImageFor}
          cropShape='rect'
          aspect={358 / 228}
        />
      )}
      <UploadPostBox>
        <section>
          <h1 className='a11y-hidden'>게시글 등록</h1>

          <form onSubmit={handleFormSubmit}>
            <ProfileImg>
              {/* 사용자 프로필 */}
              <img src={userImage} alt='' />
            </ProfileImg>
            <TextArea>
              <div>
                {/* 내용 입력 창 */}
                <textarea
                  value={content}
                  onChange={(e) => {
                    inputContent(e);
                    adjustTextareaHeight(e);
                  }}
                  id='contentTextarea'
                  name='content'
                  rows='10'
                  cols='50'
                  placeholder='내용을 입력해주세요'
                ></textarea>
              </div>
            </TextArea>

            <div>
              {/* 이미지 미리보기 */}
              {imgData && (imgData.imageUrl || imgData.croppedImageUrl) ? (
                <ImgPre>
                  <img
                    src={imgData.croppedImageUrl ? imgData.croppedImageUrl : imgData.imageUrl}
                    alt=''
                    id='imagePre'
                  />
                  <XButton>
                    <button type='button' onClick={closeImg}>
                      <img src={xButton} alt='' />
                    </button>
                  </XButton>
                </ImgPre>
              ) : null}

              {/* 이미지 등록 버튼 */}
              <InputImgIcon>
                <label htmlFor='profileImg'>
                  <img src={uploadFile} alt='' />
                </label>
                <input
                  type='file'
                  // onChange={handleChangeImage}
                  onChange={onSelectFile}
                  id='profileImg'
                  name='image'
                  accept='image/*'
                  style={{ display: 'none' }}
                />
              </InputImgIcon>
            </div>
            {isTabletScreen && (
              <ButtonSubmit
                buttonText='업로드'
                onClickHandler={submitPost}
                disabled={isButtonDisabled}
              />
            )}
          </form>
        </section>
        {isTabletScreen && <NavBar />}
      </UploadPostBox>
    </Container>
  );
}
