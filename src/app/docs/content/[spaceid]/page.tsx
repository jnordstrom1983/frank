export default function UI({ params }: { params: { spaceid: string } }) {
  return <div dangerouslySetInnerHTML={{
    __html: `
    
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
     
        <redoc spec-url='/docs/content/${params.spaceid}/api.json'></redoc>
        <script src="/static/redoc.standalone.js"> </script>
`}}>

  </div>
}