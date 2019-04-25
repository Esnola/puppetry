import { remote, shell } from "electron";

export const isEveryValueMissing = ( obj ) => Object.values( obj ).every( val => typeof val === "undefined" );
export const isSomeValueMissing = ( obj ) => Object.values( obj ).some( val => typeof val === "undefined" );

export const ruleValidateGenericString = ( rule, value, callback ) => {
  if ( value.length < 6 ) {
    return callback( "The value shall not be less than 6 characters" );
  }
  if ( value.length > 250 ) {
    return callback( "The value shall not be more than 250 characters" );
  }
  callback();
};


export function timestampToDate( timestamp ) {
  const date = new Date( timestamp * 1000 ),
        month = "0" + date.getMonth(),
        day = "0" + date.getDate(),
        hours = date.getHours(),
        minutes = "0" + date.getMinutes(),
        seconds = "0" + date.getSeconds();

  return `${ date.getFullYear() }/${ month.substr( -2 ) }/${ day.substr( -2 ) }`
    + ` ${ hours }:${ minutes.substr( -2 ) }:${ seconds.substr( -2 ) }`;
}

export const onExtClick = ( e ) => {
  e.preventDefault();
  const el = e.target;
  shell.openExternal( el.href );
};

export const closeApp = () => {
  remote.getCurrentWindow().close();
};


export function millisecondsToStr( milliseconds ) {
  let temp = milliseconds / 1000;
  const years = Math.floor( temp / 31536000 ),
        days = Math.floor( ( temp %= 31536000 ) / 86400 ),
        hours = Math.floor( ( temp %= 86400 ) / 3600 ),
        minutes = Math.floor( ( temp %= 3600 ) / 60 ),
        seconds = temp % 60;

  if ( milliseconds > 1000 ) {
    return ( years ? years + "y " : "" ) +
      ( days ? days + "d " : "" ) +
      ( hours ? hours + "h " : ""  ) +
      ( minutes ? minutes + "m " : "" ) +
      Number.parseFloat( seconds ).toFixed( 2 ) + "s";
  }

  return milliseconds + "ms";
}