import React from 'react'

class CircleIcon extends React.Component {
  render() {
    return (
      <svg width="20px" height="20px" viewBox="0 0 20 20">
        <defs>
          <polygon id="path-1" points="0 0 208 0 208 48 0 48"></polygon>
          <filter x="-0.2%" y="-1.0%" width="100.5%" height="102.1%" filterUnits="objectBoundingBox" id="filter-3">
            <feOffset dx="0" dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
          </filter>
          <polygon id="path-4" points="0 0 208 0 208 48 0 48"></polygon>
          <filter x="-0.2%" y="-1.0%" width="100.5%" height="102.1%" filterUnits="objectBoundingBox" id="filter-6">
            <feOffset dx="0" dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
          </filter>
        </defs>
        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="field-target" transform="translate(-178.000000, -14.000000)">
            <g>
              <g id="fields">
                <g id="Input">
                  <mask id="mask-2" fill="white"></mask>
                  <g>
                  </g>
                </g>
              </g>
              <g id="Input">
                <mask id="mask-5" fill="white"></mask>
              </g>
              <g id="noun_Target_880263" transform="translate(178.000000, 14.000000)" fill="#000000" fillRule="nonzero">
                <circle id="Oval" cx="10" cy="10" r="4"></circle>
                <path d="M17.6119403,9.25373134 C17.2761194,5.63432836 14.3656716,2.76119403 10.7462687,2.3880597 L10.7462687,0 L9.25373134,0 L9.25373134,2.3880597 C5.63432836,2.7238806 2.76119403,5.63432836 2.3880597,9.25373134 L0,9.25373134 L0,10.7462687 L2.3880597,10.7462687 C2.7238806,14.3656716 5.63432836,17.238806 9.25373134,17.6119403 L9.25373134,20 L10.7462687,20 L10.7462687,17.6119403 C14.3656716,17.2761194 17.238806,14.3656716 17.6119403,10.7462687 L20,10.7462687 L20,9.25373134 L17.6119403,9.25373134 Z M10,16.1567164 C6.60447761,16.1567164 3.84328358,13.3955224 3.84328358,10 C3.84328358,6.60447761 6.60447761,3.84328358 10,3.84328358 C13.3955224,3.84328358 16.1567164,6.60447761 16.1567164,10 C16.1567164,13.3955224 13.3955224,16.1567164 10,16.1567164 Z" id="Shape"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>
    )
  }
}

export default CircleIcon
