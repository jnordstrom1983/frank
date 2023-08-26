export default function UI() {
  return <div dangerouslySetInnerHTML={{
    __html: `
    
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
     
        <redoc spec-url='/docs/management/api.json'></redoc>
        <script src="/static/redoc.standalone.js"> </script>
`}}>

  </div>
}