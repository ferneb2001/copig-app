procedure spalpdra
* 01/04/2003
*listado de profesionales
*  provisorio con alternativas
*  para asamblea
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
set century on
set date to dmy
select 2
use spprof index spprof.idx
select 5
use sptitu order titulo
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
@23,01 clear to 23,78
*if wop<>1
   if wop=1
      whabi='S'
   else
      if wop=2
         whabi='N'
      else
         whabi=' '
      endif      
   endif      
   wop=1
   @08,25 say 'Categor¡a'
   @10,25 get wop pict '@*RVT \<Una categoria;\<Todas' color scheme 4
   read
   @23,01 clear to 23,78
   wcatego='  '
   if wop<>2
      @23,01 say 'Indique la categoria a listar'
      @23,31 get wcatego pict '!!'
      read
      @23,01 clear to 23,78
   endif
   @08,45 say 'Titulos'
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   @10,45 get wop pict '@*RVT \<Un t¡tulo;\<Todos' color scheme 4
   read
   if wop=2
      wtitulo='   '
   else   
      @23,01 say 'Seleccione titulo a listar y oprima <ESC>'   
      define window ptitu from 06,25 to 22,55
      activate window ptitu
      select 5
      use sptitu order titulo
      brow in window ptitu
      deactivate window ptitu
      wtitulo=titulo
      wnomtit=titplur
      @23,01 clear to 23,78
   endif
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
      select 4
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   @20,01 say 'Se listar n todos los profesionales '
   if wcatego<>'  '
      @20,37 say wcatego
      @20,39 say ', '
   endif   
   if wtitulo<>'   '
      @20,40 say rtrim(wnomtit)
   endif
   if whabi='S'
      @21,01 say '   habilitados'
   else
      if whabi='N'
         @21,01 say 'no habilitados'
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
      wpara='a'                  
      select 1
      use spmatri
      go top
      @20,10 say whabi pict 'X'
      @21,1 say numero pict '99999'
      @21,8 say dcnro  pict '99999999'
      @21,20 say habili pict '9999'
      @23,70 get wpara pict 'X'
      read
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
	      @02,05 say  numero pict '99999'
    	  @02,10 say catego
      	  if catego='A '
	      	@02,20 say vtohab
            if wcatego='  ' or catego=wcatego
             if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
               	  if condic < '2'
                 	 do arma
                  endif
               else
                  if whabi='S' 
						IF HABILI>=2009  and CONDIC <  '2'
                         		do arma
                        endif   
                  else
                     if habili < 1992 and condic < '2'
*                        do arma
                     endif   
                  endif
               endif          
            endif
         endif
         endif
*        endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on  nombre
         do imprime
      else   
            sort to sptempos on nombre
            do imprime
      endif
  endif   
*endif
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
   use sptempos
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
   wlin=0
   whoja=0
   wcant=1
   wcatego='  '
   wtotit=0
   wtcant=0
   wcandom=0
   wacum=0
   wcateg=catego
   wtitu=SPACE(3)
   wkey=wcatego+wtitu
   do titulos
   do while .not. eof()
      if wlin > 66
         do titulos
      endif   
      select 1         
     ?wcant pict '9999'   
     ??numero pict '99999' at 4
      ??nombre  at 11
     if dctipo=1
     	?? 'DNI ' at 42
     ELSE
     	IF DCTIPO=2
     		?? 'LE  ' at 42
     	ELSE
     		IF DCTIPO=3
     			?? 'LC  ' at 42
     		ELSE
     			?? '    ' at 42
     		ENDIF
     	ENDIF
     ENDIF	
      ?? dcnro  pict '99999999' at 46
      wtcant=wtcant+1
      wtotit=wtotit+1
      wcant=wcant+1
      ? titotorga at 18
      ?? '-----------------------' at 55
      ?
      wlin=wlin+3
      if wlin > 66
         do titulos
      endif
   skip
   enddo
   ?
   ?'total profesionales   : ' at 20
   ?? wtcant at 45 pict '99999'
   ?
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 66
   ? '    '
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA' 
?
?'LISTADO DE PROFESIONALES ' AT 05
if whabi='S'
   ??' (habilitados)' at 57
else
   if whabi='N'
      ??' (no habilitados)' at 57
   endif      
endif
?'Fecha: ' at 45
?? wfecha  at 52 
??'HOJA NRO. ' at 65
??whoja pict '999'
?
? 'Ord. MATRIC.   NOMBRE'
?? 'Documento' at 42
wlin = 6
return


procedure arma
	  @19,60 say "llego a arma"
      @20,60 say whabi pict 'X'
      @21,41 say numero pict '99999'
      @21,48 say dcnro  pict '99999999'
      @21,60 say habili pict '9999'
      @23,70 get wpara pict 'X'
wop=1
parar='X'
wnomtit=space(25)
wimpor=0
wfecha1={  /  /    }
@19,60 say a.vtohab
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
      wop=0
endif
@22,10 say wop
@22,1 say b.nombre
@22,40 say a.dcnro
@22,45 say a.numero
@22,53 say a.habili
@23,70 get parar
read
   wtitulo=a.titulo
   select 5
   use sptitu order titulo
   seek(wtitulo)
   if found()
       wnomtit=titdesc
   else
       wnomtit=space(30)
   endif
*   select 2      
if wop=0 
*      if wdpto=0 or b.dpto=wdpto
	    @18,10 say b.nombre
	    @18,60 say b.nacio
        wop=0
	    if wop=0
            select 3
            append blank
            replace numero with a.numero
            replace catego with a.catego
            replace titulo with a.titulo
            replace habili with a.habili
            replace condic with a.condic
            replace dctipo with b.dctipo
            replace dcnro  with b.dcnro
            replace nombre with b.nombre
            replace domici with b.domici
            replace tipodom with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with ltrim(b.telef)
            replace fecha  with b.nacio
            replace titotorga with wnomtit
            replace sptmatr  with 120-wimpor
            if a.inscr  <> {  /  /  }
             	replace fecha1  with a.inscr 
            else
               if a.fechab <> {  /  /  }
                  replace fecha1 with a.fechab
               else
               	  replace fecha1 with wfecha1   
               endif
            endif      	
*       endif  
    endif
  endif 
return

