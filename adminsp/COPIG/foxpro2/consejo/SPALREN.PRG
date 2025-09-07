procedure spalren
*listado de Representantes Tecnicos de empresas
* genera archivo para luego pasara a excel
@04,01 clear to 23,78
@04,28 say 'LISTADO DE REPRESENTANTES TECNICOS'
select 1
use spmatrie index spmatrie
select 2
use spprofe index spprofe
select 4
use spprof index spprof, spprofn
select 5
use spmatri index spmatri.idx
select 7
use sprtcos order empresa
select 3
set exclusive on
set safety off
use remtmprt
zap
set exclusive off
whabi=' '
wanhabi=0
wnumero=0
wcatego=space(2)
whabili=0
wcondic=space(1)
wdctipo=0
wdcnro=0
wnombre=space(50)
wdomici=space(40)
wprovin=0
wdpto=0
wlocali=0
wptitu=space(3)
wpnomb=space(30)
wpnumero=0
wpcatego=space(2)
wphabil=0
wrtinicio={  /  /  }
wrtfinal ={  /  /  }
wrtvinculo=0
wfecha={  /  /  }
@06,10 say 'Fecha del listado: '
@06,40 get wfecha
read
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitadas;\<No habilitadas;\<Todas';
       color scheme 5
read
@23,01 clear to 23,78
   if wop=1
      whabi='S'
      @14,02 say 'Digite a¤o de habilitaci¢n'
      @14,32 get wanhabi pict '9999' 
   else
      if wop=2
         whabi='N'
      else
         whabi=' '
      endif      
   endif      
   wop=1
   wcatego='EM'
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @08,60 say 'Departamentos'
   @10,60 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
   read
   if wop=2
      wdpto=0
   else      
      @23,01 say 'Seleccione departamento a listar y oprima <ESC>'
      define window pdpto from 06,30 to 22,50
      activate window pdpto
      select 6
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   @20,01 say 'Se listar n todas las empresas y Rep.Tcos. '
   if whabi='S'
      @21,01 say '   habilitadas'
   else
      if whabi='N'
         @21,01 say 'no habilitadas'
      endif
   endif
   if wdpto>0
      @21,16 say 'del departamento '
      @21,33 say wnomdpto
   endif
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 1
      use spmatrie
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         @18,01 say numero
         @18,08 say catego
         @18,12 say habili
         if wcatego='EM'
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili >=  wanhabi .and. condic < '2'
                        do arma
                     endif   
                  else
                     if habili < wanhabi
                        do arma
                     endif   
                  endif
                endif          
           * endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0  
*         sort to remtmpos on numero, pnumero
*         do imprime
      else   
         if wdpto<>0 
*            sort to remtmpos on numero, pnumero, dpto;
*            for dpto=wdpto
*            do imprime
         endif   
     endif
  endif   
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use remtmpos
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=0
   whoja=1
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=space(5)
   do while .not. eof()
         wkey=str(numero,5)      
         select 5
         use splocal order cod
         seek(a.locali)
         if found()
            wnomlocali=nombre
         else
            wnomlocali=space(15)
         endif
         select 4
         use spdpto order dpto
         seek(a.dpto)
         if found()
            wnomdpto=nombre
         else   
            enomdpto=space(15)
         endif
         select 1         
         ?numero pict '99999'
         ??catego at 10 
         ??nombre  at 15
         ??domici  at 67
         ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)
         wlin=wlin+1
         if wlin > 85
            do titulos
         endif
         do while str(numero,5) = wkey
            ?pcatego at 20
            ?? pnumero at 24
            ?? pnomb  at 31
            wtitu=space(3)
            wtitu=titu
            ?? wnomtit at 63
            ?? prtinicio at 90
            ?? prtfinal at 99
            ?? wvinculo at 109
            wlin = wlin + 1
            if wlin > 85
               do titulos
            endif
            skip                                                 
         enddo
   enddo
*   ???chr(27)+chr(18)
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return




procedure arma
pare=0
wnumero=numero
*wcatego=catego
whabili=habili
wcondic=condic
wdctipo=dctipo
wdcnro=dcnro
wkeyre1=str(dctipo,1)+str(dcnro,8)
select 7
@19,01 say wnumero
@19,08 say empresa
@19,15 say 'select 7 '
*@19,40 get pare
*read
locate for str(empresa,5)=str(wnumero,5)
do while found()
   @20,01 say empresa
   @20,08 say matprof
   @20,16 say categor
*   @20,50 get pare
*   read
   wrtinicio=rtinicio
   wrtfinal =rtfinal
   wrtvinculo=rtvinculo
   wvinculo=space(25)
   if wrtvinculo = 1
       wvinculo="Contrato"
   else
       if wrtvinculo = 2
           wvinculo= "Socio"
       else
          if wrtvinculo = 3
              wvinculo="Relac.Dep."
          else
             if wrtvinculo = 4
                 wvinculo="Gerente "
             else
                if wrtvinculo= 5
                    wvinculo="Apoderado"
                else
                   if wrtvinculo= 6
                       wvinculo = "Por Obra"
                   else
                      if wrtvinculo = 7
                          wvinculo = "Contrato Renov.Aut.Indet."
                      else   
                         if wrtvinculo = 8
                             wvinculo = "Propietario"
                         else   
                            if wrtvinculo = 9
                                wvinculo = "Contr.renov.Aut.det."
                            else
                               if wrtvinculo = 10
                                   wvinculo = "Otra relacion"
                               else
                                  if wrtvinculo = 11
                                      wvinculo =  "Contrato sin vencimiento"
                                  endif
                               endif
                            endif
                         endif
                      endif
                   endif
                endif
             endif
          endif
      endif
   endif               
   wkeyrt=str(matprof,5)+categor
   if categor = 'A ' 
	   select 5
  	   seek(wkeyrt)
  	   if found()
    	  wpnumero=numero
    	  wpcateg =catego
    	  wphabili=habili
    	  wtitu   =titulo
          select 6
          use sptitu order titulo
          seek(wtitu)
          if found()
             wnomtit=titdesc
          else
             wnomtit=space(25)
          endif
    	  select 5
    	  wpcondic=condic
    	  wkeyrt1=str(dctipo,1)+str(dcnro,8)
    	  select 4
   		  seek(wkeyrt1)
     	  if found()
       		  wpnomb=nombre
     	  endif
          select 2
          seek(wkeyre1)
          if found()
             if wdpto=0 or dpto=wdpto
           		 wnombre=nombre
	            wprovin=provin
    	        wdomici=domici
        	    wdpto  =dpto
	            wlocali=locali
    	        select 3
        	    append blank
	            replace numero with wnumero
    	        replace catego with wcatego
*       	     replace titulo with w.titulo
	            replace habili with whabili
    	        replace condic with wcondic
        	    replace dctipo with wdctipo
	            replace dcnro  with wdcnro
    	        replace nombre with wnombre
        	    replace domici with wdomici
	            replace provin with wprovin
    	        replace dpto   with wdpto
        	    replace locali with wlocali
	            replace titu   with wtitu
    	        replace pnomb  with wpnomb
        	    replace pnumero with wpnumero
	            replace pcatego with wpcateg
    	        replace phabil  with wphabili
        	    replace prtinicio with wrtinicio
	            replace prtfinal   with wrtfinal
    	        replace prtvinculo with wrtvinculo
        	    replace pcondic    with wpcondic
        	    replace pnomtit    with wnomtit
        	    replace prtnvinc   with wvinculo
	         endif 
    	  endif
     endif 
   endif
   select 7
   continue
enddo      
return