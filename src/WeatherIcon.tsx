import React from 'react';
import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';

const useStyles = makeStyles(() => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
}));

const WeatherIcon = ({ icon, description }: any) => {
  const classes = useStyles();

  const iconClass = classNames({
    'wi-day-sunny': icon === '01d',
    'wi-day-cloudy': icon === '02d',
    'wi-cloud': icon === '03d' || icon === '04d',
    'wi-day-rain': icon === '09d',
    'wi-day-thunderstorm': icon === '11d',
    'wi-day-snow': icon === '13d',
    'wi-day-fog': icon === '50d',
    'wi-night-clear': icon === '01n',
    'wi-night-alt-cloudy': icon === '02n',
    'wi-night-alt-cloudy-high': icon === '03n',
    'wi-night-alt-rain': icon === '09n',
    'wi-night-alt-thunderstorm': icon === '11n',
    'wi-night-alt-snow': icon === '13n',
    'wi-night-fog': icon === '50n',
  });

  return (
    <div className={classes.root}>
      <i className={`wi ${iconClass} ${classes.icon}`} />
      {description}
    </div>
  );
};

export default WeatherIcon;
