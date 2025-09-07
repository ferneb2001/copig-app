procedure spalglmp
*Genera archivo sptlma y sptlmas para La Mercantil Andina
* toma cantidad de pagos efectuados en caja2309
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
wfecha=date()
use sptlma
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
      select 1
*      use sptempos
      use spmatri
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
      if catego='A '
      @17,03 say catego
      @17,06 say numero pict '99999'
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili = 2006 and condic < '2'
                        do arma
                     endif   
                  else
                     if habili < 1992 and condic < '2'
                        do arma
                     endif   
                  endif
               endif          
            endif
         endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptlmas  on titulo, nombre 
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptlmas  on titulo, nombre
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptlmas  on titulo, nombre
            else
               sort to sptlmas  on titulo, nombre
            endif      
         endif   
     endif
  endif   
*endif
@04,01 clear to 23,78
close all
return

procedure arma
wcateg=catego
wtitu=SPACE(3)
wop1=1 
wimpor=0  
if wop1=1
	wcpos=space(4)		
    wtitu=titulo
    select 5
    use sptitu order titulo
    seek(wtitu)
    if found()
        wnomtit=titdesc
    else
        wnomtit=space(30)
    endif
    select 2
    use spprof index spprof.idx
    seek(str(a.dctipo,1)+str(a.dcnro,8))
    if found()
       select 8
       use caja2309 order matric
       go top
       locate for matric=a.numero
       do while found()
     	 if anhabil=2006
   		   if cpto='2' or cpto>'6'
   		   else
   			  wimpor=wimpor+importe
   		   endif
   	     endif
         continue
       enddo
       if wimpor<120
   	      wop=0
       else
   	      wop=1
       endif
       if wop=0		
*   if b.tipo=0
	      select 2
	      if spcpos<>0
	  	     wcpos=str(spcpos)
	      endif	
          select 6
          use splocal order cod
          seek(b.locali)
          if found()
              wnomlocali=nombre
              if wcpos='    '
         	     wcpos=cpost
              endif	
          else
              wnomlocali=space(15)
          endif
          select 4
          use spdpto order dpto
          seek(b.dpto)
          if found()
             wnomdpto=nombre
             if wcpos='    '
             	wcpos=cpost
             endif	
          else   
             wnomdpto=space(15)
          endif
          wprovc=space(15)
          if str(b.provin,3)<>'  1'
             select 7
             use spprov order prov
             seek(b.provin)
             if found()
                wprovc=nombre
                if wcpos='    '
                 	wcpost=cpost
                endif	
             else
                wprovc=space(15)
             endif
          else
             wprovc='Mendoza        '   
             if wcpos='    '
         	     wcpos='5500'
             endif	
          endif         
          if wdpto=0 or dpto=wdpto
             select 3
             append blank
             replace numero with a.numero
             replace catego with a.catego
             replace titulo with a.titulo
             replace titotorga with wnomtit
             replace habili with a.habili
             replace condic with a.condic
             replace dctipo with b.dctipo
             replace dcnro  with b.dcnro
             replace nombre with b.nombre
             replace domici with b.domici
             replace provin with wprovc
             replace dpto   with wnomdpto
             replace locali with wnomlocali
             replace telef  with ltrim(b.telef)
             replace codpos with wcpos
             replace timpor with wimpor
             replace fecha  with a.vtohab
          endif
       endif
    endif  
endif   
return