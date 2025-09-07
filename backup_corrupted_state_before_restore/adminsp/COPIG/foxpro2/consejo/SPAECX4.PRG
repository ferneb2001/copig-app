procedure spaecx4
*consulta de certificados emitidos 
@04,01 clear to 23,78
@04,24 say 'CONSULTA DE CERTIFICADOS EMITIDOS '
@06,25 say 'Oficina    :'
@07,25 say 'Matricula  :'
@08,25 say 'Nombre     :'
@09,25 say 'Fecha      :'
@10,25 say 'Certificado:'
@11,25 say 'Comitente  :'
@12,25 say 'Labor Prof.:'
@16,25 say 'Obra       :'
wofic=0
wmatric=0
wcateg=space(2)
wnomb=space(30)
wcomi=space(30)
wlabor=space(23)
wlabor1=space(69)
wlabor2=space(69)
wlabor3=space(69)
wobra=space(40)
wfech={  /  /  }
wcerti=0
wsigue='S'
wperio=1
@18,01 say 'Ingrese periodo a consultar: 1=94/95, 2=96/97, 3=98/99, 4=2000/2008 '
@18,78 get wperio pict '9'
read
if wperio=1
	select 1
	USE SPCER95 ORDER CENOMBRE
else
	if wperio=2
	    select 1
		use spcer96 order cenombre
	else
		if wperio=3
			select 1
			use spcer99 order cenombre
		else	
			if wperio=4
				select 1
				use spcer04 order cenombre
			endif
		endif
	endif
endif
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
      wlabor1=celab1
      wlabor2=celab2
      wlabor3=celab3
      wobra=ceobra
      @06,38 say ceofici pict '99'
      @07,38 say cematri pict '99999'
      @07,46 say cecateg
      @08,38 say cenombre
      @09,38 say cefecha
      @10,38 say cecerti
      @11,38 say cecomit
      @12,38 say celabor
      @13,08 say celab1
      @14,08 say celab2
      @15,08 say celab3
      @16,38 say ceobra
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
@06,38 get wofic pict '99'
@09,38 get wfech
@10,38 get wcerti pict '9999999'
@12,38 get wlabor pict '@!'
@13,08 get wlabor1 pict '@!'
@14,08 get wlabor2 pict '@!'
@15,08 get wlabor3 pict '@!'
@16,38 get wobra   pict '@!' 
*                               agregar otros campos
read
replace ceofici with wofic
replace cefecha with wfech
replace cecerti with wcerti
replace celabor with wlabor
replace celab1  with wlabor1
replace celab2  with wlabor2
replace celab3  with wlabor3
replace ceobra  with wobra
return

procedure borracert
delete
return