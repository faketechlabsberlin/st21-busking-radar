import React, { useState } from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import EventsList from './EventsList';
import selectEvents from '../../filters/events';
import { startGetAllEvents, startUpdateEvent } from '../../actions/events';
// import EventsFilters from '../Events/EventsFilters';


const MyProfile = ({ history }) => {
    const auth = useSelector(state => state.auth)
    const sortedEvents = useSelector(state => state.events.filter(event => event.userId === auth.user._id))
    const filteredEvents = useSelector(state => selectEvents(sortedEvents, state.filters))
    const [showEvents, setShowEvents] = useState(false)
    const [intervalMs, setIntervalMs] = useState(2000)
    //supporting hooks 
    //useDispatch is a new hook that replaced mapDispatchToProps. The Question, however, is how can we write a 
    //test for it. Is it possible? Check it out later for sure!!!)
    const dispatch = useDispatch();
    //useSelector here is a new hook, which replaces the mapStateToProps middleware
    //Fetching events!!!
    //auto fetching with react query
    const now = moment();
    const { status, data } = useQuery('events',
        async () => {
            const res = await axios.get('/events')
            return res.data.map(event => {
                if (moment(event.startTime).isSameOrBefore(now) &&
                    moment(event.endTime).isSameOrAfter(now) &&
                    event.active === false) {
                    return dispatch(startUpdateEvent(event._id, { ...event, active: true }))
                } else if (moment(event.endTime).isSameOrBefore(now) &&
                    event.active === true) {
                    return dispatch(startUpdateEvent(event._id, { ...event, active: false }))
                } else {
                    //setting the new interval so the react-query stopps autofetching 
                    //and starts only when we need to update the active status of the next closest in time event
                    let dates = []
                    for (let i = 0; i < res.data.length; i++) {
                        if (moment(res.data[i].startTime).unix() >= now.unix()) {
                            dates.push(moment(res.data[i].startTime).unix())
                        }
                    }
                    let neededInterval = (dates.sort()[0] - now.unix()) * 1000
                    setIntervalMs(neededInterval);
                    dispatch(startGetAllEvents())
                }
            })

        }
        , {
            refetchInterval: intervalMs
        })

    return (
        <main className='prof-page'>
            <div className='prof-bg'></div>
            {!auth.user.about && !auth.user.genre ? <p>Please fill in your profile info</p> : ''}
            <button className='btn-md btn-edit' onClick={() => {
                history.push(`/profile/${auth.user._id}`)
            }}>Edit Profile</button>
            <div className='prof-pic-container'>
                <img className='prof-pic' src={auth.user.profilePic} />
            </div>
            <h1>{auth.user.name}</h1>
            <div className='soc-links-container'>
                {auth.user.socialLinks.map(link => {
                    if (link.name === 'facebook') {
                        return <a href={link.link}><i class="fab fa-2x fa-facebook-square icon-color"></i> </a>
                    } else if (link.name === 'youtube') {
                        return <a href={link.link}><i class="fab fa-2x fa-youtube icon-color"></i></a>
                    } else {
                        return <a href={link.link}><i class="fab fa-2x fa-spotify icon-color"></i></a>
                    }
                })}
            </div>
            <div className='prof-info'>
                <p className='prof-info-genre'>{auth.user.genre}</p>
                <p className='prof-info-about'>{auth.user.about}</p>
            </div>
            <button className='btn-md btn-events' onClick={() => setShowEvents(!showEvents)}>events</button>
            {showEvents && <EventsList sortedEvents={filteredEvents}
                auth={auth}
            />}
        </main>
    )
}

export default MyProfile;