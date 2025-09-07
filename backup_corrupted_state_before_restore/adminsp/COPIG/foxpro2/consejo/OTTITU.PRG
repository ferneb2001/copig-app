procedure ottitu
parameter wkey
select 7 
use sptiaux index sptiaux
select 3
use sptitu order titulo
*wkey=str(wnumero,5)+wcatego
select 7
seek(wkey)
if found()
   select 3
   seek(g.axtitu)
   if found()
      @22,16 say titdesc
   else
      @22,16 say 'sin descripcion'
   endif
   @23,10 get wop pict '@*H \<Continuar;\<Modificar;\<Baja' size 1,1
   read
   @23,01 clear to 23,78
   if wop = 3
      select 7
      delete
   else
      if wop = 2   
         select 3
         define window pcur from 15,40 to 22,77
         activate window pcur
         brow in window pcur
         deactivate window pcur
         if titulo<>'ZZZ'
            select 7
            wfechegr={  /  /  }
            wfechegr=fechegr
            replace curso  with f.curso
            replace titulo with c.titulo
            @21,65 say 'fecha de titulo'
            @22,70 get wfechegr
            read
            replace axfecti with wfechegr
            @22,16 say f.descrip
         endif
      endif
   endif      
else
   @22,16 say 'Sin cursos de postgrado'
endif
wop=1
@23,30 get wop pict '@*H \<Salir;\<Agregar Titulo' size 1,1
read
@23,01 clear to 23,78
if wop=2
   select 6
   define window pcur from 15,40 to 22,77
   activate window pcur
   brow in window pcur
   deactivate window pcur
   if curso<>999
      select 5
      wfechegr={  /  /  }
      append blank
      replace numero with int(val(substr(wkey,1,5)))
      replace catego with substr(wkey,6,2)
      replace curso  with f.curso
      replace titulo with wqtitulo
      @21,65 say 'fecha de egreso'
      @22,70 get wfechegr
      read
      replace fechegr with wfechegr
      @22,16 say f.descrip
   endif
endif   
return
