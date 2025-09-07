procedure spalgp3i
*listado de profesionales peritos judiciales
* provisorio para varios usos
*   solo imprime sptempos ya clasificado
SET TALK OFF
@04,01 clear to 23,78
@04,23 say 'LISTADO DE PROFESIONALES PERITOS JUDICIALES'
do imprime
@04,01 clear to 23,78
close all
return

select 2
use spprof index spprof
select 4
set exclusive on
set safety off
use sptempo
zap
set exclusive off
set date ymd
wfecha=date()
@22,50 say wfecha
whabi=' '
wop=1
wcuen=0
wnomtit=space(30)
@23,01 clear to 23,78
whabi=' '
wcatego='  '
wtitulo=space(3)
wnomtit=space(30)
wtitulo='   '
wdpto=0
wnomdpto=space(15)
wdpto=0
@23,30 get wop pict '@*H \<Salir;\<Imprimir'
read
if wop=2
   SELECT 3	
   use juprof index juproi
   go top                   
   set clock on
   @14,21 to 16,57
   @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
   do while .not. eof()
      wkey=str(jumatr,5)+jucate
      select 1
      use spmatri inde spmatri
      seek(wkey)
      if found()
         do arma
      endif
      select 3
      skip
   enddo
   *@12,01 clear to 12,78       
   @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
   select 4
      sort to sptempos on tjucirc, tjuesta, titu, nombre
*      do imprime
endif   
@04,01 clear to 23,78
close all
return

procedure imprime
set date dmy
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
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   wjucirc=space(1)
   wjuesta=space(1)
   wcateg=catego
   wtitu=space(3)
   wkey=space(5)
   wkey1=wjucirc+wjuesta
   do while .not. eof()
      if tjucirc+tjuesta+titu<>wkey
         if titu<>wtitu
            wtitu=titu
            select 5
            use spjuti order tijunum
            seek(wtitu)
            if found()
               wnomtiju=tijunom
            else
               wnomtiju=space(30)
            endif
            wlin=96
            select 1      
         endif
         if tjuesta<>wjuesta
            wjuesta=tjuesta
            wlin=96
         endif
         if tjucirc<>wjucirc
            wjucirc=tjucirc
            wlin=96
         endif   
         wkey=wjucirc+wjuesta+wtitu
         if wlin > 85
            do titulos
            do titulosc
            do titulosb
*         else
*            do titulosc
*            do titulosb   
         endif   
      endif   
      select 6
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
      wprovc=space(15)
      if str(a.provin,3)<>'  1'
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
         else
            wprovc=space(15)
         endif
      endif         
      select 1         
      ?numero pict '99999'
      ??catego at 7 
      ??nombre  at 10
      ??titotorga at 41
      ??habili at 75
      ?domici  at 60
      ?? telef  at 93
      ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)+'  '+rtrim(wprovc)
      wlin=wlin+2
      wcuen=wcuen+1
      if wlin > 85
 *        eject
         do titulos
         do titulosc
         do titulosb
      endif
   skip
   enddo
   ?
   ?
   ? 'Total de profesionales listados: '
   ?? wcuen
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

procedure titulos
if wlin > 85
   if whoja > 0
      eject
   endif   
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES INSCRIPTOS PARA PERITOS JUDICIALES' at 20
??'Fecha: ' at 85
?? wfecha  at 92 
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC.CAT.   NOMBRE'
*?? ' DOMICILIO' AT 56
*?? ' TELEFONO ' AT 87
?? ' TITULO ' at 45
wlin = 5
return

procedure titulosc
?
if wjucirc = '1'
	? 'Primera Circunscripci¢n Judicial'
	WLIN=WLIN+1
else
    if wjucirc = '2'
       ? 'Segunda Circunscripci¢n Judicial'   
       wlin = wlin+1
     else
        if wjucirc = '3'
           ? 'Tercera Circunscripci¢n Judicial'
           wlin = wlin+1
        else
           if wjucirc = '4'
              ? 'Cuarta Circunscripci¢n Judicial'
              wlin= wlin +1
           endif
        endif
    endif
endif
if wjuesta = '1'
   ?
   ? 'Profesionales Habilitados'
   wlin = wlin+2
else
   if wjuesta = '2'
      ? 
      ? 'Profesionales NO Habilitados para ejercer especialidad'
      wlin = wlin + 1
   else
      if wjuesta = '3'
         ?
         ? 'Profesionales NO Habilitados para ejercer  especialidad'
         wlin = wlin+1
      else
         if wjuesta = '4'
           ?
           ? ' Profesionales NO habilitados por Falta de Pago de Matriculas'
           wlin = wlin+1
         else
            if wjuesta = '5'
              ?
              ? ' Profesionales NO habilitados por encontrase SUSPENDIDOS'
              wlin = wlin+1 
            endif
         endif
      endif
   endif
endif	
WLIN=wlin+1

procedure titulosb
?
? 'Especialidad : ' at 38
??wnomtiju AT 55
?
wlin=wlin+3
return

procedure arma
wop=0
wnoment=space(30)
if wop=0        
 select 2
 seek(str(a.dctipo,1)+str(a.dcnro,8))
 if found()
      @18,1 say a.numero
      @18,7 say a.catego
      @18,10 say b.nombre
      @18,60 say b.nacio
      select 7
      use sptitu order titulo
      seek(a.titulo)
      if found()
         wnoment=titdesc
      else
         wnoment=space(30)
      endif      
         select 4
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
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace telef  with ltrim(b.telef)
         replace titotorga with wnoment
         replace tjucirc with c.jucirc
         replace tjuesta with c.juesta
         replace titu    with c.juesp
         if a.inscr<>{  /  /  }
            replace fecha  with a.inscr
         else
            if a.fechab<>{  /  /  }
               replace fecha with a.fechab
            else   
               replace fecha with a.feccert
            endif   
         endif   
     endif 
endif
*endif
return