procedure spaec
*consulta de certificados emitidos
@04,01 clear to 23,78
@04,24 say 'CONSULTA DE CERTIFICADOS EMITIDOS'
@06,25 say 'Oficina    :'
@07,25 say 'Matricula  :'
@08,25 say 'Nombre     :'
@09,25 say 'Fecha      :'
@10,25 say 'Certificado:'
@11,25 say 'Comitente  :'
@12,25 say 'Labor Prof.:'
wofic=0
wmatric=0
wcateg=space(2)
wnomb=space(30)
wcomi=space(30)
wlabor=space(15)
wfech={  /  /  }
wcerti=0
wsigue='S'
select 1
*use spcerti index spcertof
USE SPCERTI ORDER CENOMBRE
do while wsigue='S'
   wnomb=space(30)
   wop=1
   @23,30 get wop pict '@*H \<Consultar;\<Salir' size 1,1
   read
   @23,01 clear to 23,78
   if wop=1
      @23,01 say 'Nombre del Profesional'
      @23,24 get wnomb pict '@!'
      read
      @23,01 clear to 23,78
      @23,01 say 'Seleccione un Certificado y oprima <ESC>'
      define window pcert from 06,02 to 22,78
      activate window pcert
      brow all for cenombre=rtrim(wnomb) in window pcert
      deactivate window pcert
      @23,01 clear to 23,78
      wofic=ceofici
      wmatric=cematri
      wcateg=cecateg
      wnomb=cenombre
      wcomi=cecomit
      wlabor=celabor
      wfech=cefecha
      wcerti=cecerti
      @06,40 say ceofici pict '99'
      @07,40 say cematri pict '99999'
      @07,46 say cecateg
      @08,40 say cenombre
      @09,40 say cefecha
      @10,40 say cecerti
      @11,40 say cecomit
      @12,40 say celabor
      wop=1
      @23,27 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
      read
      @23,01 clear to 23,78
      if wop=2
         do modifcert
      else
         if wop=3
            do borracert
         endif
      endif         
   else
      wsigue='N'
   endif      
enddo
@04,01 CLEAR TO 23,78
return

procedure modifcert
@06,40 get wofic pict '99'
@09,40 get wfech
@10,40 get wcerti pict '9999999'
@12,40 get wlabor pict '@!' 
read
replace ceofici with wofic
replace cefecha with wfech
replace cecerti with wcerti
replace celabor with wlabor
return

procedure borracert
delete
return