import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FileBase from 'react-file-base64';
import { Button } from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import { startUpdateUserInfo } from '../../actions/auth';
import { clearErrors } from '../../actions/error';



const EditProfileForm = (props) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const error = useSelector((state) => state.error)
    const [userData, setUserData] = useState({
        name: props.auth.user ? props.auth.user.name : '',
        email: props.auth.user ? props.auth.user.email : '',
        genre: props.auth.user ? props.auth.user.genre : '',
        about: props.auth.user ? props.auth.user.about : '',
        socialNetLinks: props.auth.user ? props.auth.user.socialNetLinks : ''.split(' '),
        selectedFile: props.auth.user ? props.auth.user.selectedFile : '',
        error: ''
    })
    const handleChange = (e) => {
        setUserData({
            ...userData,
            //this is the name of the element that we are targeting, depending on which input element
            [e.target.name]: e.target.value,
        })
    }


    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(startUpdateUserInfo(userData, props.userId))
        history.push('/events')
    }


    return (
        <form onSubmit={handleSubmit}>
            <div className='profile-edit' >
                <p>Name</p>
                <input type="text" placeholder="name" name="name" autoFocus value={userData.name || ''} onChange={handleChange} />
                <p>Genre</p>
                <input type="text" placeholder="genre" name="genre" autoFocus value={userData.genre || ''} onChange={handleChange} />
                <p>About</p>
                <input type="text" placeholder="about" name="about" autoFocus value={userData.about || ''} onChange={handleChange} />
                <p>Links</p>
                <input type="text" placeholder="links" name="socialNetLinks" autoFocus value={userData.socialNetLinks || ''} onChange={handleChange} />
                <p>Upload Image</p>
                <div className='file-input'>
                    <FileBase
                        type="file"
                        multiple={false}
                        onDone={({ base64 }) => setUserData({ ...userData, selectedFile: base64 })}
                    />
                </div>
            </div>
            <Button type='submit' className='btn-lg' size='small' >
                <PublishIcon />
                Submit
            </Button>
        </form>
    )
}

export default EditProfileForm